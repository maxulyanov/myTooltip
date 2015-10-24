# myTooltip
Powerful and modern jQuery plugin for create tooltips!

##Getting started
1. Include jQuery
2. Include myTooltip files (js and css)
3. Call myTooltip with your options after document ready
```html
<link rel="stylesheet" href="jquery.mytooltip.min.css">
<script src="jquery-1.11.3.min.js"></script>
<script src="jquery.sticky-block.js"></script>
<script>
    $(document).ready(function() {
     $('.js-mytooltip').myTooltip({
       'offset': 15,
       'theme': 'light'
     });
    });
</script>
```

##Options
Options list:
<table>
    <tr>
      <th>Name</td>
      <th>Description</th>
      <th>Expected type</th>
      <th>Default Value</th>
    </tr>
    <tr>
      <td>direction</td>
      <td>Direction of tooltip relative to the element</td>
      <td><code>String</code></td>
      <td><code>'top'</code></td>
    </tr>
    <tr>
      <td>offset</td>
      <td>Offset in px of tooltip relative to the element</td>
      <td><code>Number</code></td>
      <td><code>10</code></td>
    </tr> 
    <tr>
      <td>customClass</td>
      <td>Add custom class to the current tooltip</td>
      <td><code>String</code></td>
      <td><code>''</code></td>
    </tr>
    <tr>
      <td>template</td>
      <td>Present content</td>
      <td><code>String</code></td>
      <td><code>''</code></td>
    </tr>
    <tr>
      <td>action</td>
      <td>Javascript handlers to call tooltip: hover, click, focus </td>
      <td><code>String</code></td>
      <td><code>'hover'</code></td>
    </tr>
    <tr>
      <td>theme</td>
      <td>Ready-to-use themes</td>
      <td><code>String</code></td>
      <td><code>'default'</code></td>
    </tr>
    <tr>
      <td>ignoreClass</td>
      <td>Add class to element to ignore call</td>
      <td><code>String</code></td>
      <td><code>'js-mytooltip-ignore'</code></td>
    </tr>
    <tr>
      <td>disposable</td>
      <td>Disposable call and remove element</td>
      <td><code>Boolean</code></td>
      <td><code>false</code></td>
    </tr>    
    <tr>
      <td>fromTitle</td>
      <td>Take content from native title attributes</td>
      <td><code>Boolean</code></td>
      <td><code>false</code></td>
    </tr>    
    <tr>
      <td>cursorHelp</td>
      <td>show cursor helper to element</td>
      <td><code>Boolean</code></td>
      <td><code>false</code></td>
    </tr>    
    <tr>
      <td>hideTime</td>
      <td>Hide timer tooltip</td>
      <td><code>Number</code></td>
      <td><code>false</code></td>
    </tr>    
    <tr>
      <td>hoverTooltip</td>
      <td>Ability hover mouse on tooltip</td>
      <td><code>Boolean</code></td>
      <td><code>true</code></td>
    </tr>    
    <tr>
      <td>animateOffsetPx</td>
      <td>Animation offset in px</td>
      <td><code>Number</code></td>
      <td><code>15</code></td>
    </tr>    
    <tr>
      <td>animateDuration</td>
      <td>Animation speed in mc</td>
      <td><code>Number</code></td>
      <td><code>200</code></td>
    </tr>
</table>


##Options data-attributes
All options are supported in the format data attr, uppercase symbol replace delimiter.
Example:
- direction: 'left' -> data-mytooltip-direction = "left"
- hideTime: 1000 -> data-mytooltip-hide-time = "1000"
- hoverTooltip: false -> data-mytooltip-hover-tooltip = "false"
- etc


##Template
- Javascript option:
```html
<script>
  $('.js-mytooltip-template').myTooltip({
   'template': '<a href="https://en.wikipedia.org/wiki/Mars" target="_blank">read more</a>'
  });
</script>
```

- Html data attributes:
```html
 <div class="js-mytooltip-template"
    data-mytooltip-template="<a href="https://en.wikipedia.org/wiki/Mars" target="_blank">read more</a>
 </div>
```
- Dom container:
```html
 <div class="js-mytooltip-template" data-mytooltip-template=".wrapper-template"></div>
 <div class="wrapper-template" <a href="https://en.wikipedia.org/wiki/Mars" target="_blank">read more</a></div>
```


##Action
Actions list:
- hover
- click
- focus


##Events
Events list:<br>
<code>show-before</code> - start show tooltip<br>
<code>show-complete</code> - end show tooltip<br>
<code>hide-beforee</code> - start hide tooltip<br>
<code>hide-complete</code> - end hide tooltip
```html
<script>
     $('.js-mytooltip').on('show-before', function() {
       console.log('show-before!')
     });
   
     $('.js-mytooltip').on('show-complete', function() {
       console.log('show-complete!');
     });
   
     $('.js-mytooltip').on('hide-before', function() {
       console.log('hide-before!');
     });
   
     $('.js-mytooltip').on('hide-complete', function() {
       console.log('hide-complete!');
     });
</script>
```

##Public methods
<code>Call</code> - show current tooltip
```html
<script>
    setTimeout(function() {
      $('.js-mytooltip').myTooltip('call');
    }, 300);
</script>
```
<code>Update</code> - update storage myTooltip for dynamic elements
```html
<script>
    $('.js-mytooltip').myTooltip('update');
</script>
```
<code>Destroy</code> - remove current tooltip from myTooltip
```html
<script>
    $('.js-mytooltip').myTooltip('destroy');
</script>
```


##Browser Support
All modern browsers and IE9+

##Example
See detail example - <a href="http://m-ulyanov.github.io/mytooltip/">myTooltip</a>