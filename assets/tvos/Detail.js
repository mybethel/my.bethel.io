var Detail = {

  doc: '',
  uuid: null,

  load: function(uuid) {
    this.uuid = uuid;
    var self = this;
    getDocument('mobile/detail/' + uuid, function(template) {
      self.doc = template;
      self.init();
    });
  },

  init: function() {
    var self = this;
    navigationDocument.presentModal(this.doc);
    this.doc.addEventListener('select', function() {
      navigationDocument.dismissModal();
    });
  }

};
