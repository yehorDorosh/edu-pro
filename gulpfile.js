/* global process */
'use strict'
const gulp = require('gulp');
const sass = require('gulp-sass');
const debug = require('gulp-debug'); // Выводит имена файлов прошедшие через него
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const del = require('del');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify'); // обработчик ошибок
const newer = require('gulp-newer');
const plumber = require('gulp-plumber'); // навешивает обрадотчик ошибок на все потоки таски

sass.compiler = require('node-sass');
const isDev = !process.env.NODE_ENV || process.env.NODE_ENV == 'dev';

const srcName = 'src';
const destName = 'dest';
const paths = {
  src: {
    img: `${srcName}/img/**/*.*`,
    html: `${srcName}/html/**/*.html`,
    styles: `${srcName}/styles/**/*.sass`
  },
  dest: {
    img: `${destName}/img`,
    html: `${destName}`,
    styles: `${destName}/styles`,
  }
}

gulp.task('img', () => {
  return gulp.src(paths.src.img, {since: gulp.lastRun('img')}) // since: применяется только к тем файлам которые изменились с заданной даты  gulp.lastRun - дата последнего запуска задачи
    .pipe(newer(paths.dest.img)) // Пропускает только новые файлы или новые версии уже имеющихся файлов 
    .pipe(debug({title: 'img'}))
    .pipe(gulp.dest(paths.dest.img));
});

gulp.task('html', () => {
  return gulp.src(paths.src.html, {since: gulp.lastRun('html')})
    .pipe(newer(paths.dest.html))
    .pipe(debug({title: 'html'}))
    .pipe(gulp.dest(paths.dest.html));
});

gulp.task('clean', () => {
  return del(destName);
});

gulp.task('styles', () => {
  return gulp.src('frontend/styles/main.sass')
    .pipe(plumber({ // применяет обработчик ошибок ко всем потокам сразу
      errorHandler: notify.onError(err => {
        return {
          title: 'Styles',
          message: err.message
        };
      })
    }))
    .pipe(gulpIf(isDev, sourcemaps.init()))
    .pipe(sass())
    .pipe(gulpIf(isDev, sourcemaps.write('.'))) // по умолчанию сорсмап пишется в тот же файл как коментарий, параметр '.' создаст отдельный файл для соср мапа
    .pipe(gulp.dest('public'));
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('img', 'html')
  )
);