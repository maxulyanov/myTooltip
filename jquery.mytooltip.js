// myTooltip Plugin v1.0.0 for jQuery
// Author: M.Ulyanov
// Created: 29/09/2015
// Example: -

;(function ($) {

  'use struct';

  var tooltipsStorage = {};
  var tooltipsSettingsStorage = {};
  var tooltipId = 0;
  var tooltipLastShowId = false;

  var tooltipClasses = {
    'base' : 'system-mytooltip--base',
    'item' : 'system-mytooltip--item',
    'hover': 'system-mytooltip--hover',
    'backing': 'system-mytooltip--backing',
    'help' : 'mytooltip--cursor-help'
  };

  var directionClasses = {
    'top'   : 'mytooltip--top',
    'right' : 'mytooltip--right',
    'bottom': 'mytooltip--bottom',
    'left'  : 'mytooltip--left'
  };

  var eventsNames = {
    'showBefore': 'show-before',
    'showComplete': 'show-complete',
    'hideBefore': 'hide-before',
    'hideComplete': 'hide-complete'
  };


  /**
   * Set global events
   */
  $(document).on('mouseleave', '.' + tooltipClasses.hover, function (event) {
    if(!$(event.target).hasClass(tooltipClasses.backing)) {
      methods.hide();
    }
  });

  $(document).on('click', function (event) {
    if (!$(event.target).hasClass(tooltipClasses.base)) {
      tooltipLastShowId = false;
      methods.hide();
    }
  });

  var methods = {

    init: function (options) {

      var self = $(this);
      var id = tooltipId;
      tooltipId++;
      self.attr('data-mytooltip-id', id);

      var currentOptions = $.extend(true, {}, methods.getDefaultOptions(), options);
      currentOptions = methods.mergeAttributesAndOptions(self, currentOptions);

      if(currentOptions.template === null) return;

      tooltipsStorage[id] = {
        'id': id,
        'current': self,
        'options': currentOptions
      };

      self.addClass(tooltipClasses.base);
      if(currentOptions.cursorHelp) {
        self.addClass(tooltipClasses.help);
      }
      methods.setEvents(tooltipsStorage[id]);

    },

    create: function (data) {

      var id = data.id;
      if (!methods.isEmptyObjectProperty(id)) return;

      if (tooltipLastShowId === id) {
        methods.hide();
        methods.resetLastShow();
        return;
      }
      tooltipLastShowId = id;

      methods.callEvents(data.current, eventsNames.showBefore);

      var options = data.options;
      var direction = directionClasses[options.direction];
      var tooltip = $('<div style="display: none;" data-mytooltip-id="' + id + '" class="mytooltip system-mytooltip--' +
          options.action + ' ' + tooltipClasses.item + ' ' + direction + ' ' + options.customClass + '">' + options.template + '</div>');

      if (options.theme) {
        tooltip.addClass('mytooltip-theme-' + options.theme);
      }

      if (options.hoverTooltip) {
        tooltip.append('<div class="mytooltip-backing ' + tooltipClasses.backing + '">');
      }

      methods.hide(tooltip, options);
      $('body').append(tooltip);
      methods.setPosition(data, tooltip);
      methods.show(tooltip, data);

    },

    resetLastShow: function () {

      tooltipLastShowId = false;

    },

    show: function (tooltip, data) {

      var options = data.options;

      tooltip.fadeIn({
        queue: false,
        duration: options.animateDuration
      });

      // Variants
      switch (options.direction) {
        case 'top':
          tooltip.animate({
            'top': parseInt(tooltip.css('top')) + options.animateOffsetPx
          }, options.animateDuration);
          break;
        case 'right':
          tooltip.animate({
            'left': parseInt(tooltip.css('left')) - options.animateOffsetPx
          }, options.animateDuration);
          break;
        case 'bottom':
          tooltip.animate({
            'top': parseInt(tooltip.css('top')) - options.animateOffsetPx
          }, options.animateDuration);
          break;
        case 'left':
          tooltip.animate({
            'left': parseInt(tooltip.css('left')) + options.animateOffsetPx
          }, options.animateDuration);
          break;
        default :
          methods.error('Direction: ' + options.direction + ' not found!');
          return false;
      }


      setTimeout(function() {
        methods.callEvents(data.current, eventsNames.showComplete);
      }, options.animateDuration);

    },

    hide: function (tooltip, options) {

      var duration;
      var item = $('.' + tooltipClasses.item);
      var id = item.data('mytooltip-id');

      if (!methods.isEmptyObjectProperty(id)) return;

      if (options) {
        duration = options.animateDuration;
      }
      else if (id !== undefined) {
        duration = tooltipsStorage[+id].options.animateDuration;
      }

      var base = $('.' + tooltipClasses.base + "[data-mytooltip-id='" + id + "']");
      methods.callEvents(base, eventsNames.hideBefore);

      item.stop().fadeOut(duration, function () {
        methods.remove(tooltip, base);
      });

    },

    remove: function (tooltip, base) {

      if (tooltip) {
        $('.' + tooltipClasses.item).each(function () {
          if (tooltip[0] != $(this)[0]) {
            $(this).remove();
          }
        })
      }
      else {
        $('.' + tooltipClasses.item).remove();
      }

      methods.callEvents(base, eventsNames.hideComplete);

    },

    setPosition: function (data, tooltip) {

      var current = $(data.current);
      var position = current.offset();
      var options = data.options;
      var sizeElement = {
        height: current.outerHeight(),
        width: current.outerWidth()
      };
      var sizeTooltip = {
        height: tooltip.outerHeight(),
        width: tooltip.outerWidth()
      };

      var animateOffsetPx = options.animateOffsetPx ? options.animateOffsetPx : 0;

      var backing = tooltip.find('.mytooltip-backing');
      var sizeBacking = 0;

      switch (options.direction) {

        case 'top':
          tooltip.css({
            'left': position.left + (sizeElement.width / 2) - (sizeTooltip.width / 2),
            'top': position.top - sizeTooltip.height - options.offset - animateOffsetPx
          });
          sizeBacking = position.top - parseInt(tooltip.css('top')) - sizeTooltip.height - animateOffsetPx;
          backing.css({
            'height': sizeBacking,
            'bottom': -sizeBacking,
            'left': 0
          });
          break;

        case 'right':
          tooltip.css({
            'left': position.left + sizeElement.width + options.offset + animateOffsetPx,
            'top': position.top - (sizeTooltip.height / 2) + (sizeElement.height / 2)
          });
          sizeBacking = parseInt(tooltip.css('left')) - position.left - sizeElement.width - animateOffsetPx;
          backing.css({
            'height': sizeTooltip.height,
            'width': sizeBacking,
            'top': 0,
            'left': -sizeBacking
          });
          break;

        case 'bottom':
          tooltip.css({
            'left': position.left + (sizeElement.width / 2) - (sizeTooltip.width / 2),
            'top': position.top + sizeElement.height + options.offset + animateOffsetPx
          });
          sizeBacking = parseInt(tooltip.css('top')) - position.top - sizeElement.height - animateOffsetPx;
          backing.css({
            'height': sizeBacking,
            'top': -sizeBacking,
            'left': 0
          });
          break;

        case 'left':
          tooltip.css({
            'left': position.left - sizeTooltip.width - options.offset - animateOffsetPx,
            'top': position.top - (sizeTooltip.height / 2) + (sizeElement.height / 2)
          });
          sizeBacking = position.left - parseInt(tooltip.css('left')) - sizeTooltip.width - animateOffsetPx;
          backing.css({
            'height': sizeTooltip.height,
            'width': sizeBacking,
            'top': 0,
            'right': -sizeBacking
          });
          break;

        default:
          methods.error('Direction: ' + options.direction + ' not found!');
          return false;
      }

    },

    setEvents: function (data) {

      var action = data.options.action;
      var current = data.current;
      var options = data.options;

      switch (action) {
        case 'click':
          current.on(action, function (event) {
            if (!methods.isEmptyObjectProperty(data.id)) return;
            event.preventDefault();
            methods.create(data);
          });
          break;
        case 'hover':
        case 'focus':
          if (!methods.isEmptyObjectProperty(data.id)) return;
          var actionGet;
          var actionLose;
          if (action === 'hover') {
            actionGet = 'mouseenter';
            actionLose = 'mouseleave';
          }
          else if (action === 'focus') {
            actionGet = 'focus';
            actionLose = 'blur';
          }
          current.on(actionGet, function (event) {
            if (!$(event.relatedTarget).is('.' + tooltipClasses.item + ',' + '.' + tooltipClasses.backing)) {
              methods.create(data);
            }
          });
          current.on(actionLose, function (event) {
            methods.resetLastShow();
            if (!options.hoverTooltip) {
              methods.hide();
            }
            else if (!$(event.relatedTarget).is('.' + tooltipClasses.item + ',' + '.' + tooltipClasses.backing)) {
              methods.hide();
            }
          });
          break;
        default:
          methods.error('Action: ' + options.action + ' not found!');
          return false;
      }

    },

    getDefaultOptions: function () {

      return {
        'direction'       : 'top',
        'offset'          : 10,
        'customClass'     : '',
        'template'        : null,
        'action'          : 'hover',
        'theme'           : 'default',
        'cursorHelp'      : false,
        'hoverTooltip'    : true,
        'animateOffsetPx' : 15,
        'animateDuration' : 200
      }

    },

    mergeAttributesAndOptions: function (current, options) {

      return {
        'direction'       : current.data('mytooltip-direction')         || options.direction,
        'offset'          : current.data('mytooltip-offset')            || options.offset,
        'customClass'     : current.data('mytooltip-class')             || options.customClass,
        'template'        : current.data('mytooltip-text')              || options.template,
        'action'          : current.data('mytooltip-action')            || options.action,
        'theme'           : current.data('mytooltip-theme')             || options.theme,
        'hoverTooltip'    : current.data('mytooltip-hover') != undefined ?
                            current.data('mytooltip-hover'):options.hoverTooltip,
        'cursorHelp'      : current.data('mytooltip-cursor-help')       || options.cursorHelp,
        'animateOffsetPx' : current.data('mytooltip-animate-offset-px') >= 0 ?
                            current.data('mytooltip-animate-offset-px') : options.animateOffsetPx,
        'animateDuration' : current.data('mytooltip-animate-duration')  || options.animateDuration
      }

    },

    /**
     * Call plugin events
     */
    callEvents: function (current, event) {

      $(current).trigger(event);

    },

    isEmptyObjectProperty: function(id) {

      return tooltipsStorage[id] !== undefined;

    },

    update: function(args, selector) {

      $(this).myTooltip(tooltipsSettingsStorage[selector]);

    },

    /**
     * Delete item from the plugin
     */
    destroy: function () {

      var $self = $(this);
      for (var block in tooltipsStorage) {
        if (tooltipsStorage.hasOwnProperty(block)) {
          if ($self.data('mytooltip-id') === $(tooltipsStorage[block].current).data('mytooltip-id')) {
            delete tooltipsStorage[block];
            $self.removeClass(tooltipClasses.base);
            var attributes = $.extend({}, $self.get(0).attributes);
            $.each(attributes, function (i, attr) {
              var name = attr.name;
              if (~name.indexOf('data-mytooltip')) {
                $self.removeAttr(name);
              }
            });

          }
        }
      }

    },

    /**
     * Report error
     * @param message - Message to console.error
     */
    error: function (message) {

      console.error(message);

    }

  };


  /**
   * Add new function to jQuery.fn
   * @param method - String name method or user settings
   * @returns {*}
   */
  $.fn.myTooltip = function (method) {

    var args = arguments;
    var selector = this.selector;

    if ($(this).length === 0) {
      methods.error('Element: ' + selector + ' not found!');
      return;
    }

    return this.each(function () {
      if (methods[method]) {
        return methods[method].apply(this, [args, selector]);
      }
      else if (typeof method === 'object' || !method) {
        tooltipsSettingsStorage[selector] = args[0];
        return methods.init.apply(this, args);
      }
      else {
        methods.error('Method ' + method + ' not found!');
      }
    });

  };

})(jQuery);