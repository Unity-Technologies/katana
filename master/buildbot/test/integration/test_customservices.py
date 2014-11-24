# This file is part of Buildbot.  Buildbot is free software: you can
# redistribute it and/or modify it under the terms of the GNU General Public
# License as published by the Free Software Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright Buildbot Team Members

from buildbot.test.util.integration import RunMasterBase
from twisted.internet import defer

# This integration test creates a master and slave environment,
# with one builder and a custom step
# The custom step is using a CustomService, in order to calculate its result
# we make sure that we can reconfigure the master while build is running


class CustomServiceMaster(RunMasterBase):

    @defer.inlineCallbacks
    def doForceBuild(self):

        # force a build, and wait until it is finished
        d = defer.Deferred()
        consumer = yield self.master.mq.startConsuming(
            lambda e, data: d.callback(data),
            ('builds', None, 'finished'))

        # use data api to force a build
        yield self.master.data.control("force", {}, ("forceschedulers", "force"))

        # wait until we receive the build finished event
        build = yield d
        consumer.stopConsuming()

        # enrich the build result, with the step results
        build["steps"] = yield self.master.data.get(("builds", build['buildid'], "steps"))
        defer.returnValue(build)

    @defer.inlineCallbacks
    def test_customService(self):
        m = self.master

        build = yield self.doForceBuild()

        self.failUnlessEqual(build['steps'][0]['state_string'], 'num reconfig: 1')

        myService = m.namedServices['myService']
        self.failUnlessEqual(myService.num_reconfig, 1)

        yield m.reconfig()

        build = yield self.doForceBuild()

        self.failUnlessEqual(myService.num_reconfig, 2)
        self.failUnlessEqual(build['steps'][0]['state_string'], 'num reconfig: 2')

        yield m.reconfig()

        myService2 = m.namedServices['myService2']

        self.failUnlessEqual(myService2.num_reconfig, 3)
        self.failUnlessEqual(myService.num_reconfig, 3)

        yield m.reconfig()

        # second service removed
        self.failIfIn('myService2', m.namedServices)
        self.failUnlessEqual(myService2.num_reconfig, 3)
        self.failUnlessEqual(myService.num_reconfig, 4)


# master configuration

num_reconfig = 0


def masterConfig():
    global num_reconfig
    num_reconfig += 1
    c = {}
    from buildbot.config import BuilderConfig
    from buildbot.process.factory import BuildFactory
    from buildbot.schedulers.forcesched import ForceScheduler
    from buildbot.steps.shell import ShellCommand
    from buildbot.util.service import ReconfigurableService

    class MyShellCommand(ShellCommand):

        def getResultSummary(self):
            service = self.master.namedServices['myService']
            return dict(step=u"num reconfig: %d" % (service.num_reconfig,))

    class MyService(ReconfigurableService):
        name = "myService"

        def reconfigServiceWithConstructorArgs(self, num_reconfig):
            self.num_reconfig = num_reconfig
            return defer.succeed(None)

    c['schedulers'] = [
        ForceScheduler(
            name="force",
            builderNames=["testy"])]

    f = BuildFactory()
    f.addStep(MyShellCommand(command='echo hei'))
    c['builders'] = [
        BuilderConfig(name="testy",
                      slavenames=["local1"],
                      factory=f)]

    c['services'] = [MyService(num_reconfig=num_reconfig)]
    if num_reconfig == 3:
        c['services'].append(MyService(name="myService2", num_reconfig=num_reconfig))
    return c
