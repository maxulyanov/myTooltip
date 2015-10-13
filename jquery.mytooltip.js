// myTooltip Plugin v1.0.0 for jQuery
// Author: M.Ulyanov
// Created: 29/09/2015
// Example: -

;(function ($) {

  'use strict';

  var tooltipsStorage = {};
  var tooltipsSettingsStorage = {};
  var tooltipId = 0;
  var tooltipLastShowId = false;

  var tooltipClasses = {
    'base'   : 'system-mytooltip--base',
    'item'   : 'system-mytooltip--item',
    'hover'  : 'system-mytooltip--hover',
    'backing': 'system-mytooltip--backing',
    'help'   : 'mytooltip--cursor-help'
  };

  var directionClasses = {
    'top'   : 'mytooltip--top',
    'right' : 'mytooltip--right',
    'bottom': 'mytooltip--bottom',
    'left'  : 'mytooltip--left'
  };

  var eventsNames = {
    'showBefore'  : 'show-before',
    'showComplete': 'show-complete',
    'hideBefore'  : 'hide-before',
    'hideComplete': 'hide-complete'
  };


  /**
   * Set global events
   */
  $(document).on('mouseleave', '.' + tooltipClasses.hover, function (event) {
    methods.hide();
  });

  $(document).on('click', function (event) {
    if (!$(event.target).hasClass(tooltipClasses.base)) {
      tooltipLastShowId = false;
      methods.hide();
    }
  });

  // Add support trim method
  if (!String.prototype.trim) {
    (function() {
      String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
      };
    })();
  }

  var methods = {

    /**
     * Main method
     * @param options - object user options
     */
    init: function (options) {

      var self = $(this);

      if(self.attr('data-mytooltip-id')) return;

      var id = tooltipId;
      tooltipId++;
      self.attr('data-mytooltip-id', id);

      var userOptions = $.extend(true, {}, options, methods.getAttrOptions(self));
      var currentOptions = $.extend(true, {}, methods.getDefaultOptions(), userOptions);

      if(methods.stringToBoolean(currentOptions.fromTitle)) {
        var selfTitle = self.attr('title');
        currentOptions.template = selfTitle ? selfTitle : currentOptions.template;
      }

      if(currentOptions.template == null) return;

      if (typeof currentOptions.template === 'string'
          && currentOptions.template[0] === '{' && currentOptions.template[1] === '{') {
        currentOptions.template = methods.getHtmlTemplate(currentOptions.template);
      }

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
     * Create current tooltip
     * @param data - tooltipsStorage[id]
     */
    create: function (data) {

      var id = data.id;
      var current = $(data.current);
      if (!methods.isEmptyObjectProperty(id) || current.hasClass(data.options.ignoreClass)) return;

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
      methods.setPosition(tooltip, data);

    },

    /**
     * Get HTML template
     * @param string - {{ selector }}
     * @returns {*} - HTML template or null
     */
    getHtmlTemplate: function(string) {

      var selector = string.slice(2).slice(0, -2).trim();
      if($(selector).length) {
        return $(selector).html()
      }
      else {
        methods.error('Element: ' + selector + ' not found!');
        return null;
      }

    },

    /**
     * Reset last ID
     */
    resetLastShow: function () {

      tooltipLastShowId = false;

    },

    /**
     * String "true" and "false" to Boolean type
      * @param string
     * @returns {boolean}
     */
    stringToBoolean: function(string) {

      if(typeof string === 'boolean') return string;
      return string === 'true';

    },

    /**
     * Show current tooltip
     * @param tooltip - DOM object tooltip
     * @param data - tooltipsStorage[id]
     * @returns {boolean} - default case - return false and call error message
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
        if(options.hideTime) {
          methods.hideTimer(tooltip, options);
        }
      }, options.animateDuration);

    },

    /**
     * Hide current tooltip timer
     * @param tooltip - DOM object tooltip
     * @param options - current options tooltipsStorage[id].options
     */
    hideTimer: function(tooltip, options) {

      var delay = parseInt(options.hideTime);
      if(!delay || delay < 0) delay = 0;

      setTimeout(function() {
        if(tooltip.is(':visible')) {
          methods.hide(tooltip, options);
        }
      }, delay);

    },

    /**
     * Hide current tooltip
     * @param tooltip - DOM object tooltip
     * @param options - current options tooltipsStorage[id].options
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
        methods.remove(tooltip, id, base);
      });

    },

    /**
     *
     * @param tooltip - DOM object tooltip
     * @param id - current tooltip ID
     * @param base - base DOM element
     */
    remove: function (tooltip, id, base) {

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
     * Set position current tooltip
     * @param data - tooltipsStorage[id]
     * @param tooltip - DOM object tooltip
     * @returns {boolean} - default case - return false and call error message
     */
    setPosition: function (tooltip, data) {

      var current = $(data.current);
      var position = current.offset();
      var options = data.options;
      var image = tooltip.find('img');
      var animateOffsetPx = options.animateOffsetPx ? parseInt(options.animateOffsetPx) : 0;
      var backing = tooltip.find('.mytooltip-backing');
      var sizeBacking = 0;
      var sizeElement = {
        height: current.outerHeight(),
        width: current.outerWidth()
      };
      var sizeTooltip = {};

      if (image.length > 0) {
        image.load(function () {
          setSizeTooltip();
        });
      }
      else {
        setSizeTooltip();
      }

      function setSizeTooltip() {
        sizeTooltip.height = tooltip.outerHeight();
        sizeTooltip.width = tooltip.outerWidth();
        callSwith();
      }

      function callSwith() {
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

        methods.show(tooltip, data);

      }
    },

    /**
     *
     * @param data - tooltipsStorage[id]
     * @returns {boolean} - default case - return false and call error message
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

            if (!options.hoverTooltip || !methods.stringToBoolean(options.hoverTooltip) ) {
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
     * Get options data-* attributes
     * @param current - current DOM element
     * @returns {{}} - object options data-* attributes
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
        'ignoreClass'     : 'js-mytooltip-ignore',
        'disposable'      : false,
        'fromTitle'       : false,
        'cursorHelp'      : false,
        'hideTime'        : false,
        'hoverTooltip'    : true,
        'animateOffsetPx' : 15,
        'animateDuration' : 200
      }

    },


    /**
     * Call plugin events
     * @param current - DOM element
     * @param event - Event name property eventsNames
     */
    callEvents: function (current, event) {

      $(current).trigger(event);

    },

    /**
     * Check property in tooltipsStorage
     * @param id - ID
     * @returns {boolean} - false or true
     */
    isEmptyObjectProperty: function(id) {

      return tooltipsStorage[id] !== undefined;

    },

    /**
     *
     * @param params
     */
    call: function(params) {

      var current = $(params.selector);
      var id = current.data('mytooltip-id');

      if(id >= 0) {
        methods.create(tooltipsStorage[id]);
      }
      else {
        methods.error('Method Call: ID not found!');
      }

    },

    /**
     * Reinit plugin by dinamic elements
     * @param params - object options
     */
    update: function(params) {

      $(this).myTooltip(tooltipsSettingsStorage[params.selector]);

    },

    /**
     * Delete item from the plugin
     * @param params - object options
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