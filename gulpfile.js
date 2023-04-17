const project_folder = "dist";
const source_folder = "src";

const path = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/img/",
		fonts: project_folder + "/fonts/",
	},
	src: {
		html: [source_folder + "/pages/*.html", "!" + source_folder + "partials/_*.html"],
		css: source_folder + "/scss/style.scss",
		js: source_folder + "/js/script.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,jfif,ico,webp}",
		fonts: source_folder + "/fonts/**/*",
	},
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,jfif,ico,webp}"
	},
	clean: "./" + project_folder + "/"
}

import gulp from 'gulp';
import browsersync from 'browser-sync';
import fileinclude from 'gulp-file-include';
import { deleteAsync as del } from 'del';
// import scss from 'gulp-sass';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';

import autoprefixer from 'gulp-autoprefixer';
import group_media from 'gulp-group-css-media-queries';
import clean_css from 'gulp-clean-css';
import rename from 'gulp-rename';
import uglify from 'gulp-uglify-es';
import imagemin from 'gulp-imagemin';
import webphtml from 'gulp-webp-html';
import webpcss from 'gulp-webpcss';
import webp from 'imagemin-webp';
import ghPages from 'gh-pages';
import pathVar from 'path';
import newer from 'gulp-newer';

const {src, dest}  = gulp;
const scss = gulpSass(dartSass);

export function browserSync(params) {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/"
		},
		port: 3000,
		notify: false
	})
}

export function html() {
	return src(path.src.html)
		.pipe(fileinclude())
		// .pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream())
}

export function css() {
	return src(path.src.css)
		.pipe(
			scss({ outputStyle: 'expanded' }).on('error', scss.logError)
		)
		.pipe(
			group_media()
		)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(webpcss(
			{
				webpClass: "._webp"
			}
		))
		.pipe(dest(path.build.css))
		.pipe(clean_css())
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream())
}
export function js() {
	return src(path.src.js)
		.pipe(fileinclude())
		.pipe(dest(path.build.js))
	
		.on('error', function (err) { console.log(err.toString()); this.emit('end'); })
		.pipe(
			rename({
				extname: ".min.js"
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream())
}

export function images() {
	return src(path.src.img)
		.pipe(newer(path.build.img))
		.pipe(
			imagemin([
				webp({
					quality: 75
				})
			])
		)
		.pipe(
			rename({
				extname: ".webp"
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(newer(path.build.img))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.img))
}

export function fonts() {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts));
};

function cb() { }
export function watchFiles(params) {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], images);
}

export function clean(params) {
	return del(path.clean);
}

export function deploy(cb) {
	ghPages.publish(pathVar.join(process.cwd(), './dist'), cb);
}


  
export const fontsBuild = gulp.series(fonts);
export const buildDev = gulp.series(clean, gulp.parallel(fontsBuild, html, css, js, images));
const dev = gulp.series(buildDev, gulp.parallel(watchFiles, browserSync));
export default dev;
