define(["jquery","helpers"],function(e,t){var n;return n={buildDetail:function(n,r){try{var i=JSON.parse(n);e.each(i,function(i,s){var o=s.times[0],u=s.times[1],a=s.text;console.log(n);var f=setInterval(function(){t.startTimer(e("#elapsedTimeJs"),o)},1e3);u&&(clearInterval(f),window.location.hash||(window.location=window.location+"#finished",window.location.reload()),sock.close());var l=0;e.each(s.steps,function(n,i){var s=i.isStarted,o=i.isFinished===!0,u=s&&!o,a=i.times[0],f=i.times[1],c=t.getResult(i.results[0]),h=i.hidden===!0;if(h!=1){l=++l;if(u){var p=i.logs.length>0,d=i.urls.length>0;if(p){var v="";e(".logs-txt",r).eq(l-1).text("Logs"),e.each(i.logs,function(e,t){var n=t[0],r=t[1];v+='<li class="s-logs-js"><a href='+r+">"+n+"</a></li>"}),e(".log-list-js",r).eq(l-1).html(v)}if(d){var m="";e.each(i.urls,function(e,n){m+='<li class="urls-mod log-list-'+t.getResult(n.results)+'"><a href="'+n.url+'">'+e+"</a></li>"}),e(".log-list-js",r).eq(l-1).append(m)}e(".update-time-js",r).eq(l-1).html("Running"),e(".s-text-js",r).eq(l-1).html(i.text.join(" ")),e(".s-result-js",r).eq(l-1).removeClass().addClass("running result s-result-js"),e(r).eq(l-1).removeClass().addClass("status-running")}else o&&(e(".update-time-js",r).eq(l-1).html(t.getTime(a,f)),e(".s-result-js",r).eq(l-1).removeClass().addClass(c+" result s-result-js"),e(r).eq(l-1).removeClass().addClass("finished status-"+c))}})})}catch(s){}},buildersPage:function(t,n){try{var r=JSON.parse(t),i=0;e.each(r,function(t,r){r.project==="All Branches"&&(i=++i,n.each(function(){t===e(".bname-js",this).text().trim()&&r.pendingBuilds&&e(".current-cont",this).html('<a class="more-info popup-btn-js mod-1" data-rt_update="pending" href="#" data-in="'+(i-1)+'"> Pending jobs </a>')}))})}catch(s){}},frontPage:function(t){function n(t){var n=0;return e.each(t,function(){n+=parseFloat(this)||0}),n}console.log("frontpage");try{var r=JSON.parse(t),i=[];e.each(r.builders,function(e,n){console.log(t),i.push(n.pendingBuilds)}),e("#pendingBuilds").html(n(i));var s=[];e.each(r.slaves,function(e){s.push(e)}),e("#slavesNr").html(s.length)}catch(o){}}},n});