'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: "/**\n"+
            "/* @update <%= grunt.template.today('yyyy-mm-dd') %> \n"+
            "*/\n\n",
    uglify: {
      //文件头部输出信息
      options: {
         banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      my_target: {
         files: [
             {
                 expand: true,
                 //相对路径
                 cwd: 'js/',
                 src: ['*.js', '!*.min.js'],   // 匹配相对于cwd目录下的所有css文件(排除.min.css文件)
                 dest: 'js/',
                 ext: '.min.js'     // 生成的文件都使用.min.css替换原有扩展名，生成文件存放于dest指定的目录中
             }
         ]
      }
    },
    watch: {
      files: ['css/*.css', 'js/*.js'],
      tasks: ['m','j']
    }
  });

  
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['uglify']);
  grunt.registerTask('j', ['uglify']);
  grunt.registerTask('w', ['watch']);

};
