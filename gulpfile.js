"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
// предотвращает прерывание потока в случае какой-то ошибки
var plumber = require("gulp-plumber");
// карты источников
var sourcemap = require("gulp-sourcemaps");
// переименование
var rename = require("gulp-rename");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
// CSS минификатор
var csso = require("gulp-csso");

// объединяет все подключаемые SVG файлы и записывает их в HTML как <symbol> для дальнейшего использования
var svgstore = require("gulp-svgstore");
// // ------------------
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var htmlmin = require("gulp-htmlmin");
var uglify = require("gulp-uglify");
//
var webp = require("gulp-webp");
var imagemin = require("gulp-imagemin");
//
var del = require("del");

// -------------------
var server = require("browser-sync").create();


gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("css-view", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("open/css"))
    .pipe(server.stream());
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest("build"));
})

gulp.task("html-view", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest("open"));
})

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

gulp.task("js", function () {
  return gulp.src("source/js/**/*.js")
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += ".min";
    }))
    .pipe(gulp.dest("build/js"));
})

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}", "source/img/**",
    "source/js/**",
    "source/*.ico"
  ], {
  base: "source"
  })
.pipe(gulp.dest("build"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/sp-*.svg")
    .pipe(svgstore({ inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("clean", async function () {
  return
  del("build");
});

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
  "sprite",
  "html"
));

gulp.task("server", function () {
  server.init({
    server: "build/" });
    gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css", "refresh"));
    gulp.watch("source/*.html", gulp.series("html", "refresh"));
    gulp.watch("source/js/**/*.js", gulp.series("js", "refresh"));
});

gulp.task("server-view", function () {
  server.init({
    server: "",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css-dev"));
  gulp.watch("*.html", gulp.series("refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("build", gulp.series("clean", "copy", "css", "images", "webp", "js", "html"));
gulp.task("start", gulp.series("build", "server"));
gulp.task("view", gulp.series("css-view", "html-view", "server-view"));
