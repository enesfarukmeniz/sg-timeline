# sg-timeline

**crons**
<pre>
00 1 * * * cd /path/to/project/scripts && /usr/bin/node sg-crawler.js >> ../cronlogs.log 2>&1
05 1 * * * cd /path/to/project/scripts && /usr/bin/node sc-crawler.js >> ../cronlogs.log 2>&1
10 1 * * * cd /path/to/project/scripts && /usr/bin/node win-fixer_weekly.js >> ../cronlogs.log 2>&1
10 1 * * * cd /path/to/project/scripts && /usr/bin/node win-fixer_monthly.js >> ../cronlogs.log 2>&1
15 1 * * 1 cd /path/to/project/scripts && /usr/bin/node statistics_weekly.js >> ../cronlogs.log 2>&1
15 * 1 * * cd /path/to/project/scripts && /usr/bin/node statistics_monthly.js >> ../cronlogs.log 2>&1
</pre>
