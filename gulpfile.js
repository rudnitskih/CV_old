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
    filter = require('gulp-filter'),
    deploy = require('gulp-gh-pages'),
    pdf = require('phantom-html2pdf'),
    nib = require('nib');

;
gulp.task('jade', ["yaml"], function(){
  var jsonData = combineJSONFiles("./src/tmp/data");
  gulp.src('./src/*.jade')
    .pipe(data( function(file) {
      return jsonData;
    }))
    .pipe(jade({ pretty: true }))
    .on('error', console.log)
    .pipe(gulp.dest('./out/'))
    .pipe(livereload());
});

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
        import: ["nib", "variables", "mixins"],
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

gulp.task('server', function() {
    connect()
      .use(require('connect-livereload')())
      .use(serveStatic(__dirname + '/out'))
      .listen('8080');
    console.log('Сервер работает по адресу http://localhost:8080');
});

 gulp.task('watch', function(){
      livereload.listen();

      gulp.watch(['src/blocks/**/*.jade', 'src/layouts/*.jade', 'src/*.jade' ] ,['jade']);
      gulp.watch('src/data/*.yaml',['jade']);
      gulp.watch([ 'src/blocks/**/*.coffee', 'src/assets/scripts/*.coffee' ],['scripts']);
      gulp.watch([ 'src/blocks/**/*.styl', 'src/assets/styles/*.styl' ],['styles']);
      gulp.start('server');
  });
  gulp.task('default',['watch', 'jade', 'imagemin', "scripts", "styles", "fonts" ]);

  gulp.task('pdf', function () {
    createPdf({
      "html": "./out/index.html",
      "css": "./out/assets/project.css",
      "js": "./out/assets/project.js",
      "paperSize": {
         delay: 4000
      }
    })
  });

    
gulp.task('deploy', ['pdf'], function () {
  return gulp.src("./out/**/*")
    .pipe(deploy())
});



function combineJSONFiles(dir) {
    var files = fs.readdirSync(dir),
        data = {};

    for (var i in files) {
      data[ path.basename( files[i], ".json" )] = JSON.parse( fs.readFileSync( dir + "/" + files[i] ));
    };
    
    return data;
}

function createPdf(options){
  pdf.convert(options, function(result) {
    result.toBuffer(function(returnedBuffer) {});
    var stream = result.toStream();
    var tmpPath = result.getTmpPath();
    result.toFile("./out/SV_Frontend_Rudnytskykh.pdf", function() {});
  });
}