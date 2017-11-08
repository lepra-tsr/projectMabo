"use strict";

class DatalistInput {
  
  get data() {
    return this._data;
  }
  
  set data(value) {
    this._data = value;
    this.render();
  }
  
  get val() {
    return this.$input.val();
  }
  
  set val(val) {
    this.$input.val(val);
  }
  
  constructor(config) {
    
    this.id               = config.id;
    this._data            = [].concat(config.data);
    this.before           = '';
    this.label            = config.label;
    this.placeholder      = config.placeholder;
    this.callbackOnChange = config.onChange;
    this.$dom             = $('<div></div>');
    
    this.render();
  }
  
  render() {
    
    if (typeof this.$input !== 'undefined') {
      this.$input.blur();
      this.before = this.val;
    }
    
    this.$dom.empty();
    
    this.$label    = $('<label></label>').text(this.label || '');
    this.$input    = $('<input />', {
      addClass   : 'browser-default',
      type       : 'text',
      placeholder: this.placeholder || '',
      name       : this.id,
      list       : this.id,
    });
    this.$dataList = $('<datalist>', {id: this.id});
    this.data.forEach((d) => {
      let option = $('<option></option>', {value: d});
      this.$dataList.append(option);
    });
    
    this.$dom.append(this.$label);
    this.$label.append(this.$input);
    this.$label.append(this.$dataList);
    
    this.val    = this.before;
    this.before = '';
    
    this.$input.on('focus', () => {
      this.before = this.val;
      this.$input.select();
    });
    this.$input.on('change',
      () => {
        this.onEdit.call(this);
      });
    this.$input.on('blur',
      () => {
      });
    this.$input.on('keypress', (e) => {
      if (e.keyCode === 13) {
        this.$input.blur();
      }
    });
  }
  
  onEdit() {
    if (!this.val || this.val === this.before) {
      this.val    = this.before;
      this.before = '';
      return false;
    }
    this.before = '';
    this.callbackOnChange();
  }
}

module.exports = DatalistInput;