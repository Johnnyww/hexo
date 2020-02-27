var gulp = require('gulp');
var minifycss = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
var htmlclean = require('gulp-htmlclean');
var imagemin = require('gulp-imagemin');

// 压缩html
gulp.task('minify-html', function() {
    return gulp.src('./public/**/*.html')
        .pipe(htmlclean())
        .pipe(htmlmin({
            collapseWhitespace: true, //从字面意思应该可以看出来，清除空格，压缩html，这一条比较重要，作用比较大，引起的改变压缩量也特别大
            collapseBooleanAttributes: true, //省略布尔属性的值，比如：<input checked="checked"/>,那么设置这个属性后，就会变成 <input checked/>
            removeComments: true, //清除html中注释的部分
            removeEmptyAttributes: true, //清除所有的空属性
            removeScriptTypeAttributes: true, //清除所有script标签中的type="text/javascript"属性。
            removeStyleLinkTypeAttributes: true, //清楚所有Link标签上的type属性。
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
        }))
        .pipe(gulp.dest('./public'));
});
// 压缩css
gulp.task('minify-css', function() {
    return gulp.src('./public/**/*.css')
        .pipe(minifycss({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./public'));
});
// 压缩js !代表排除的js,例如['!./public/js/**/*min.js']
gulp.task('minify-js', function() {
    return gulp.src(['./public/js/**/.js'])
        .pipe(uglify()) //压缩混淆
        .pipe(gulp.dest('./public'));
});
// 压缩public/images 目录内图片(gulp Version>3)
//            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
//             progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
//             interlaced: false, //类型：Boolean 默认：false 隔行扫描gif进行渲染
//             multipass: false, //类型：Boolean 默认：false 多次优化svg直到完全优化
gulp.task('minify-images', function() {
    return gulp.src('./public/images/**/*.*')
        .pipe(imagemin(
        [imagemin.gifsicle({interlaced: true,optimizationLevel: 3}),
        imagemin.mozjpeg({progressive: true}),
        imagemin.optipng({optimizationLevel: 7}),
        imagemin.svgo({
		plugins: [
			{removeViewBox: true},
			{cleanupIDs: false}
		]
	})],
        {verbose: true}))
        .pipe(gulp.dest('./public/images'));
});
//4.0以后的写法
// 执行 gulp 命令时执行的任务
gulp.task('default',gulp.series(gulp.parallel('minify-html','minify-css','minify-js','minify-images')));

