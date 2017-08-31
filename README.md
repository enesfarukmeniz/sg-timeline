# sg-timeline

**crons**
<pre>
00 1 * * * cd /path/to/project && /usr/bin/node sg-crawler.js >> cronlogs.log 2>&1
05 1 * * * cd /path/to/project && /usr/bin/node sc-crawler.js >> cronlogs.log 2>&1
10 1 * * * cd /path/to/project && /usr/bin/node win-fixer.js >> cronlogs.log 2>&1
15 1 * * 1 cd /path/to/project && /usr/bin/node statistics.js >> cronlogs.log 2>&1
</pre>
