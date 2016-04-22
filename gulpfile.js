var gulp = require('gulp');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var htmlmin = require('gulp-htmlmin');
var watch = require('gulp-watch');

gulp.task('styles', function(){
    return gulp.src('src/app/css/app.css')
    .pipe(gulp.dest('www/app/css'))
});

gulp.task('compress', function(){
    return gulp.src('src/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.html', htmlmin({collapseWhitespace: true}) ))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest('www'))
});

gulp.task('watch', function(){
    gulp.watch('src/app/css/*.css', ['styles']);
    gulp.watch(['src/*.html', 'src/app/js/*.js'], ['compress']);
});

gulp.task('default', ['styles', 'compress']);
