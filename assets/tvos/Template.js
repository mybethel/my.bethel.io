function Template() {
  this.content = '';
};

Template.prototype.render = function() {
  var template = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
      ${this.content}
    </document>`

  template = new DOMParser().parseFromString(template, 'application/xml');
  return template;
};

Template.prototype.alert = function(title, description) {
  this.content = `<alertTemplate>
                    <title>${title}</title>
                    <description>${description}</description>
                    <button>
                      <text>Done</text>
                    </button>
                  </alertTemplate>`;
  return this;
}

Template.prototype.parade = function(title, section, relatedContent) {
  this.content = `<paradeTemplate>
     <list>
        <header>
           <title>${relatedContent}</title>
        </header>
        <section>
           ${section}
        </section>
        <relatedContent>
           ${relatedContent}
        </relatedContent>
     </list>
  </paradeTemplate>`;
  return this;
};
