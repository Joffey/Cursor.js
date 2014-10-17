Cursor.js
=========

安卓电视端光标（焦点框）移动插件，依赖于jQuery或Zepto。支持异步加载后焦点定位，手动控制焦点定位等。

简单示例
=========
```html
<div class="j-table" id="demo1" data-nth="0" data-focus=",,,">
	<div class="j-tr">
		<div class="j-td"></div>
		<div class="j-td"></div>
		<div class="j-td"></div>
		<div class="j-td"></div>
		<div class="j-td"></div>
	</div>
	<div class="j-tr">
		<div class="j-td"></div>
		<div class="j-td"></div>
		<div class="j-td"></div>
		<div class="j-td"></div>
		<div class="j-td"></div>
	</div>
</div>
<script>
var cs = TV.Cursor();
</script>
```
