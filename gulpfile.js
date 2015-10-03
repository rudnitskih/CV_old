var gulp = require('gulp'),
    livereload = require('gulp-livereload'),
    connect = require('connect'),
    fs = require('fs'),
    serveStatic = require('serve-static'),
    jade = require('gulp-jade'),
    data = require('gulp-data'),
    imagemin = require('gulp-imagemin'),
    path = require("path"),
    yaml = require('gulp-yaml'),
    bower = require('gulp-bower'),
    rigger = require('gulp-rigger'),
    mainBowerFiles = require('main-bower-files'),
    stylus = require('gulp-stylus'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    streamqueue = require('streamqueue'),
    filter = require('gulp-filter')
    nib = require('nib');

;
/*
 * Создаём задачи 
 *
 * stylus – для CSS-препроцессора Stylus
 * jade – для HTML-препроцессора Jade
 * coffee – для JavaScript-препроцессора CoffeеScript
 * concat – для склейки всех CSS и JS в отдельные файлы
 */


gulp.task('jade', ["yaml"], function(){
  console.log("jade");
  jsonData = combineJSONFiles("./src/tmp/data");
  gulp.src('./src/*.jade')
    .pipe(data( function(file) {
      // console.log(combineJSONFiles("./src/tmp/data"));
      return jsonData;
    }))
    .pipe(jade({ pretty: true }))
    .on('error', console.log) // Выводим ошибки в консоль
    .pipe(gulp.dest('./out/')) // Выводим сгенерированные HTML-файлы в ту же папку по тем же именем, но с другим расширением
    .pipe(livereload()); // Перезапускаем сервер LiveReload
});

// gulp.task('bower', function() {
//   gulp.src(mainBowerFiles())
//   .pipe(plugins.filter('*.js'))
//   .pipe( doing something with the JS scripts )
//   .pipe(gulp.dest(dest + 'js'));

//     .pipe(gulp.dest('./out/assets/lib'))
// });

gulp.task('scripts',function(){
  streamqueue({ objectMode: true },
    gulp.src(mainBowerFiles())
      .pipe(filter('*.js')),
    gulp.src('./src/assets/scripts/*.coffee')
      .pipe(coffee({bare: true}))
      .on('error', console.log),
    gulp.src('./src/blocks/**/*.coffee')
      .pipe(coffee())
      .on('error', console.log)  
  ).pipe(concat("project.js"))
  .pipe(gulp.dest('./out/assets/'))
  .pipe(livereload());
});

gulp.task('styles', function() {
  var stylFilter = filter('*.styl', { restore: true });
  streamqueue({ objectMode: true }, 
    gulp.src(mainBowerFiles())
      .pipe(filter('*.css')),
    gulp.src('./src/assets/styles/*')
      .pipe(stylFilter)
      .pipe(stylus({
        use: nib(),
        paths: ['node_modules', 'src/globals'],
        import: ["nib", "variables"],
        compress: true,
        'include css': true
      }))
      .on('error', console.log)
      .pipe(stylFilter.restore),
    gulp.src('./src/blocks/**/*.styl')
      .pipe(stylus({
        use: nib(),
        paths: ['node_modules', 'src/globals'],
        import: ["nib", "variables"],
        compress: true,
        'include css': true
      }))
      .on('error', console.log)  
  ).pipe(concat("project.css"))
  .pipe(gulp.dest('./out/assets/'))
  .pipe(livereload());
});

// gulp.task('concat', function(){
//   gulp.task('coffee');
//  gulp.src('./public/js/*.js')
//    .pipe(concat('scripts.js'))
//     .pipe(gulp.dest('./public/min/'))
//    .pipe(livereload());
//   gulp.task('styl');
//  gulp.src('./public/css/*.css')
//    .pipe(concat('styles.css'))
//     .pipe(gulp.dest('./public/min/'))
//    .pipe(livereload());
// });
gulp.task('fonts', function() {
    gulp.src('./src/assets/f/**/*.{ttf,woff,eot,svg}')
    .pipe(gulp.dest('./out/assets/f/'));
});

gulp.task('imagemin',function(){
   gulp.src('./src/assets/i/**/*')
      .pipe(imagemin())
      .pipe(gulp.dest('./out/assets/i/'));
});

gulp.task('yaml',function(){
  console.log('yaml');
   gulp.src('./src/data/*.yaml')
      .pipe(yaml())
      .pipe(gulp.dest('./src/tmp/data'));
});

/*
 * Создадим веб-сервер, чтобы работать с проектом через браузер
 */
 gulp.task('server', function() {
    connect()
      .use(require('connect-livereload')())
      .use(serveStatic(__dirname + '/out'))
      .listen('8080');
    console.log('Сервер работает по адресу http://localhost:8080');
});


 /*
  * Создадим задачу, смотрящую за изменениями
  */
 gulp.task('watch', function(){
      livereload.listen();

      // gulp.watch('./styl/*.styl',['stylus']);
      gulp.watch(['src/blocks/**/*.jade', 'src/layouts/*.jade', 'src/*.jade' ] ,['jade']);
      gulp.watch('src/data/*.yaml',['jade']);
      // gulp.watch('./src/assets/i/**/*',['imagemin']);

      gulp.watch([ 'src/blocks/**/*.coffee', 'src/assets/scripts/*.coffee' ],['scripts']);
      gulp.watch([ 'src/blocks/**/*.styl', 'src/assets/styles/*.styl' ],['styles']);
      // gulp.watch(['./public/js/*.js','./public/css/*.css'],['concat']);
      gulp.start('server');
  });

 // gulp.task('default',['watch','stylus','jade','coffee','concat','imagemin']);
 gulp.task('default',['watch', 'jade', 'imagemin', "scripts", "styles", "fonts" ]);

function combineJSONFiles(dir) {
    var files = fs.readdirSync(dir),
        data = {};

    for (var i in files) {
      data[ path.basename( files[i], ".json" )] = JSON.parse( fs.readFileSync( dir + "/" + files[i] ));
    };
    return data;
}