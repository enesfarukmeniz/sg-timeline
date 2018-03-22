const gulp = require('gulp');

const del = require('del'),
    htmlmin = require('gulp-htmlmin'),
    nano = require('gulp-cssnano'),
    usemin = require('gulp-usemin'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglifyes'),
    rev = require('gulp-rev'),
    tar = require('gulp-tar'),
    nodemon = require('gulp-nodemon'),
    gzip = require('gulp-gzip'),
    merge = require('merge-stream');

const applicationName = 'sg_timeline';

const bases = {
    src: 'src',
    public: 'public',
    dist: 'dist',
    tmp: 'tmp',
    distpublic: 'dist/public',
    tmppublic: 'tmp/public'
};

gulp.task('clean', function () {
    return del([bases.dist, applicationName + '*.tar.gz']);
});

gulp.task('minify', ['clean'], function () {
    let main = gulp.src(bases.public + '/*.html')
        .pipe(usemin({
            html: [function () {
                return htmlmin({collapseWhitespace: true});
            }],
            css: [nano(), rev()],
            js: [ngAnnotate(), uglify(), rev()]
        }))
        .pipe(gulp.dest(bases.distpublic));

    let views = gulp.src(bases.public + '/views/**/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(bases.distpublic + '/views'));

    return merge(main, views);
});

gulp.task('copy', ['clean'], function () {
    let img = gulp.src([bases.public + '/img/**/*']).pipe(gulp.dest(bases.distpublic + '/img'));
    let favicon = gulp.src([bases.public + '/favicon.ico']).pipe(gulp.dest(bases.distpublic));
    let fonts = gulp.src(['bower_components/bootstrap/fonts/**/*', 'bower_components/components-font-awesome/fonts/**/*']).pipe(gulp.dest(bases.distpublic + '/fonts'));
    let node = gulp.src(['package.json', 'config.json.example', bases.src + '/**/*']).pipe(gulp.dest(bases.dist));

    return merge(fonts, favicon, img, node);
});

gulp.task('build', ['clean', 'minify', 'copy']);

gulp.task('compress', ['build'], function () {
    return gulp.src([bases.dist + '/**/*'])
        .pipe(tar(applicationName + '-' + ((new Date()).getTime()) + '.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('.'));
});

gulp.task('default', ['build', 'compress']);

const fastDist = function () {
    return gulp.src(bases.public + '/*.html')
        .pipe(usemin({
            html: [htmlmin()],
            css: [rev()],
            js: [rev()]
        }))
        .pipe(gulp.dest(bases.tmppublic));
};

const copyNode = function () {
    return gulp.src([bases.src + '/index.js', 'config.json'])
        .pipe(gulp.dest(bases.tmp));
};

gulp.task('fast-dist', function () {
    return fastDist();
});

gulp.task('fast-dist-watch', function () {
    del([bases.tmppublic + '/*.js', bases.tmppublic + '/*.css']).then(_ => {
        return fastDist();
    });
});

gulp.task('copy-tmp', function () {
    let fonts = gulp.src(['bower_components/bootstrap/fonts/**/*', 'bower_components/components-font-awesome/fonts/**/*']).pipe(gulp.dest(bases.tmppublic + '/fonts'));
    let favicon = gulp.src([bases.public + '/favicon.ico']).pipe(gulp.dest(bases.tmppublic));
    let img = gulp.src([bases.public + '/img/**/*']).pipe(gulp.dest(bases.tmppublic + '/img'));
    let views = gulp.src(bases.public + '/views/**/*.html')
        .pipe(htmlmin())
        .pipe(gulp.dest(bases.tmppublic + '/views'));

    return merge(fonts, favicon, img, views);
});

gulp.task('watch', function () {
    return gulp.watch([bases.public + '/**/*.html', bases.public + '/**/*.js', bases.public + '/**/*.css'], ['fast-dist-watch', 'copy-tmp']);
});

gulp.task('copy-node', function () {
    return copyNode();
});

gulp.task('nodemon', ['copy-node'], function (cb) {
    let started = false;
    return nodemon({
        script: bases.tmp + '/index.js',
        watch: bases.src + '/index.js'
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    }).on('restart', function () {
        copyNode();
    });
});

gulp.task('server', ['copy-node', 'copy-tmp', 'fast-dist', 'nodemon', 'watch']);

