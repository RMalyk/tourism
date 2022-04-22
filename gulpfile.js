let project_folder = "dist";
let source_folder = "src";



let path = {
    biuld: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        images: project_folder + "/images/",
        fonts: project_folder + "/fonts/"
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        images: source_folder + "/images/**/*",
        fonts: source_folder + "/fonts/**/*"
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        images: source_folder + "/images/**/*"
    },
    clean: "./" + project_folder + "/"
}

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    gulp_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    webp = require('gulp-webp'),
    webp_html = require('gulp-webp-html'),
    webp_css = require('gulp-webp-css'),
    woff2 = require('gulp-ttf2woff2'),
    woff = require('gulp-ttf2woff'),
    uglify = require('gulp-uglify-es').default,
    browserSync = require('browser-sync').create();


function browsersync() {
    browserSync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webp_html())
        .pipe(dest(path.biuld.html))
        .pipe(browserSync.stream())
}
function img() {
    return src(path.src.images)
        .pipe(webp({
            quality: 70
        }))
        .pipe(dest(path.biuld.images))
        .pipe(src(path.src.images))
        .pipe(imagemin({
            interlaced: true,
            progressive: true,
            optimizationLevel: 3,
            svgoPlugins: [{ removeViewBox: false }]
        }))
        .pipe(dest(path.biuld.images))
        .pipe(browserSync.stream())
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.biuld.js))
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(dest(path.biuld.js))
        .pipe(browserSync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(scss({
            outputStyle: "expanded"
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 5 versions"],
            cascade: true
        }))
        .pipe(gulp_media())
        // .pipe(webp_css())
        .pipe(dest(path.biuld.css))
        .pipe(clean_css())
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(dest(path.biuld.css))
        .pipe(browserSync.stream())
}


function watchFilles() {
    gulp.watch([path.watch.html], html),
        gulp.watch([path.watch.css], css),
        gulp.watch([path.watch.js], js),
        gulp.watch([path.watch.images], img)
}

function clean() {
    return del(path.clean)
}

function fonts() {
    src(path.src.fonts)
        .pipe(woff())
        .pipe(dest(path.biuld.fonts))
    return src(path.src.fonts)
        .pipe(woff2())
        .pipe(dest(path.biuld.fonts))
}

let build = gulp.series(clean, gulp.parallel(js, css, html, img, fonts))
let watch = gulp.parallel(build, watchFilles, browsersync);

exports.js = js;
exports.img = img;
exports.css = css;
exports.html = html;
exports.watch = watch;
exports.fonts = fonts;
exports.build = build;
exports.default = watch;