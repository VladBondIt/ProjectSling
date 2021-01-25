"use strict";

const { src, dest, parallel, series, watch } = require("gulp"),
    autoprefixer = require("gulp-autoprefixer"),
    cssbeautify = require("gulp-cssbeautify"),
    removeComments = require('gulp-strip-css-comments'),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
    cssnano = require("gulp-cssnano"),
    plumber = require("gulp-plumber"),
    imagemin = require("gulp-imagemin"),
    del = require("del"),
    notify = require("gulp-notify"),
    webpackStream = require('webpack-stream'),
    fileinclude = require('gulp-file-include'),
    groupMedia = require('gulp-group-css-media-queries'),
    webp = require('gulp-webp'),
    webphtml = require('gulp-webp-html'),
    webpCss = require('gulp-webp-css'),
    browserSync = require("browser-sync").create();



/* Paths */
const srcPath = 'src/';
const distPath = 'dist/';

const path = {
    build: {
        html: distPath,
        js: distPath + "assets/js/",
        css: distPath + "assets/css/",
        images: distPath + "assets/images/",
        fonts: distPath + "assets/fonts/"
    },
    src: {
        html: [srcPath + '/*.html', '!' + srcPath + '/_*.html'],
        js: srcPath + "assets/js/*.js",
        css: srcPath + "assets/scss/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    watch: {
        html: srcPath + "**/*.html",
        js: srcPath + "assets/js/**/*.js",
        css: srcPath + "assets/scss/**/*.scss",
        images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
    },
    clean: "./" + distPath
};



/* Tasks */

function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        },
        port: 3050,
        notify: false,
    });
}

function html() {
    return src(path.src.html)
        .pipe(plumber())
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({ stream: true }));


}

function css() {
    return src(path.src.css, { base: srcPath + "assets/scss/" })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "SCSS Error",
                    message: "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(
            groupMedia()
        )
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 version'],
            cascade: true
        }))
        .pipe(webpCss())
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({ stream: true }));


}

function cssWatch() {
    return src(path.src.css, { base: srcPath + "assets/scss/" })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "SCSS Error",
                    message: "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass({
            includePaths: './node_modules/'
        }))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({ stream: true }));


}

function js() {
    return src(path.src.js, { base: srcPath + 'assets/js/' })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "JS Error",
                    message: "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(webpackStream({
            mode: "production",
            output: {
                filename: 'app.js',
            },
            module: {
                rules: [
                    {
                        test: /\.(js)$/,
                        exclude: /(node_modules)/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['@babel/preset-env']
                        }
                    }
                ]
            }
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }));


}

function jsWatch() {
    return src(path.src.js, { base: srcPath + 'assets/js/' })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "JS Error",
                    message: "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(webpackStream({
            mode: "development",
            output: {
                filename: 'app.js',
            }
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }));


}

function images() {
    return src(path.src.images)
        .pipe(
            webp({
                quality: 70
            })
        )
        .pipe(dest(path.build.images))
        .pipe(src(path.src.images))
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.mozjpeg({ quality: 80, progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({ stream: true }));


}

function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({ stream: true }));


}



function clean() {
    return del(path.clean);


}

function watchFiles() {
    watch([path.watch.html], html);
    watch([path.watch.css], cssWatch);
    watch([path.watch.js], jsWatch);
    watch([path.watch.images], images);
    watch([path.watch.fonts], fonts);
}

const build = series(clean, parallel(html, css, js, images, fonts));
const watching = parallel(build, watchFiles, serve);



/* Exports Tasks */

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.clean = clean;
exports.build = build;
exports.watching = watching;
exports.default = watching;
