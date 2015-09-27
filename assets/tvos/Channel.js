var Channel = {

  doc: '',
  uuid: null,

  load: function(uuid) {
    this.uuid = uuid;
    var self = this;
    getDocument('mobile/channel/' + uuid, function(template) {
      self.doc = template;
      self.init();
    });
  },

  init: function() {
    var self = this;
    navigationDocument.pushDocument(this.doc);
    this.doc.addEventListener('select', this.select);
  },

  select: function(event) {
    var selectedElement = event.target;
    console.log(selectedElement.getAttribute('action'));
  }

};
