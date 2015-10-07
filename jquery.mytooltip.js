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

    /**
     *
     * @param options
     */
    init: function (options) {

      var self = $(this);

      if(self.attr('data-mytooltip-id')) return;

      var id = tooltipId;
      tooltipId++;
      self.attr('data-mytooltip-id', id);

      var userOptions = $.extend(true, {}, options, methods.getAttrOptions(self));
      var currentOptions = $.extend(true, {}, methods.getDefaultOptions(), userOptions);

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

    /**
     *
     * @param data
     */
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

    /**
     *
     */
    resetLastShow: function () {

      tooltipLastShowId = false;

    },

    /**
     *
     * @param tooltip
     * @param data
     * @returns {boolean}
     */
    show: function (tooltip, data) {

      var options = data.options;
      var duration = parseInt(options.animateDuration);

      tooltip.fadeIn({
        queue: false,
        duration: duration
      });

      // Variants
      switch (options.direction) {
        case 'top':
          tooltip.animate({
            'top': parseInt(tooltip.css('top')) + options.animateOffsetPx
          }, duration);
          break;
        case 'right':
          tooltip.animate({
            'left': parseInt(tooltip.css('left')) - options.animateOffsetPx
          }, duration);
          break;
        case 'bottom':
          tooltip.animate({
            'top': parseInt(tooltip.css('top')) - options.animateOffsetPx
          }, duration);
          break;
        case 'left':
          tooltip.animate({
            'left': parseInt(tooltip.css('left')) + options.animateOffsetPx
          }, duration);
          break;
        default :
          methods.error('Direction: ' + options.direction + ' not found!');
          return false;
      }


      setTimeout(function() {
        methods.callEvents(data.current, eventsNames.showComplete);
      }, options.animateDuration);

    },

    /**
     *
     * @param tooltip
     * @param options
     */
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
        methods.remove(tooltip, base, id);
      });

    },

    /**
     *
     * @param tooltip
     * @param base
     * @param id
     */
    remove: function (tooltip, base, id) {

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

      if(tooltipsStorage[id].options.disposable) {
        methods.destroy({'id':id});
      }

    },

    /**
     *
     * @param data
     * @param tooltip
     * @returns {boolean}
     */
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

      var animateOffsetPx = options.animateOffsetPx ? parseInt(options.animateOffsetPx) : 0;

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

    /**
     *
     * @param data
     * @returns {boolean}
     */
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

            if (!options.hoverTooltip || options.hoverTooltip === 'false' ) {
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

    /**
     *
     * @param current
     * @returns {{}}
     */
    getAttrOptions: function (current) {

      var defaultOptions = this.getDefaultOptions();
      var dataOptions = {};

      for (var option in defaultOptions) {
        var symbolArray = option.split('');
        var currentAttrName = '';
        symbolArray.forEach(function (item) {
          var itemToLowerCase = item.toLocaleLowerCase();
          if (item !== itemToLowerCase) {
            currentAttrName += '-';
          }
          currentAttrName += itemToLowerCase;
        });

        var dataAttrValue = $(current).attr('data-mytooltip-' + currentAttrName);

        if (dataAttrValue !== undefined) {
          dataOptions[option] = dataAttrValue;
        }
      }

      return dataOptions;

    },

    /**
     *
     * @returns {{direction: string, offset: number, customClass: string, template: null, action: string, theme: string, cursorHelp: boolean, hoverTooltip: boolean, animateOffsetPx: number, animateDuration: number}}
     */
    getDefaultOptions: function () {

      return {
        'direction'       : 'top',
        'offset'          : 10,
        'customClass'     : '',
        'template'        : null,
        'action'          : 'hover',
        'theme'           : 'default',
        'disposable'      : false,
        'cursorHelp'      : false,
        'hoverTooltip'    : true,
        'animateOffsetPx' : 15,
        'animateDuration' : 200
      }

    },


    /**
     *
     * @param current
     * @param event
     */
    callEvents: function (current, event) {

      $(current).trigger(event);

    },

    /**
     *
     * @param id
     * @returns {boolean}
     */
    isEmptyObjectProperty: function(id) {

      return tooltipsStorage[id] !== undefined;

    },

    /**
     *
     * @param args
     * @param selector
     */
    update: function(params) {

      $(this).myTooltip(tooltipsSettingsStorage[params.selector]);

    },

    /**
     * Delete item from the plugin
     */
    destroy: function (params) {

      var $self;
      var id = params.id;
      if (id !== undefined) {
        $self = $('.' + tooltipClasses.base + '[data-mytooltip-id="' + id + '"]');
        delete tooltipsStorage[id];
        removeData($self);
      }
      else {
        $self = $(this);
        for (var block in tooltipsStorage) {
          if (tooltipsStorage.hasOwnProperty(block)) {
            if ($self.data('mytooltip-id') === $(tooltipsStorage[block].current).data('mytooltip-id')) {
              delete tooltipsStorage[block];
              removeData($self);
            }
          }
        }
      }

      function removeData(self) {
        self.removeClass(tooltipClasses.base);
        var attributes = $.extend({}, self.get(0).attributes);
        $.each(attributes, function (i, attr) {
          var name = attr.name;
          if (~name.indexOf('data-mytooltip')) {
            self.removeAttr(name);
          }
        });
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
        return methods[method].apply(this, [{
          'args': args,
          'selector': selector
        }]);
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