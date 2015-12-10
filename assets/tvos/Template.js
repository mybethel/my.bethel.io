function Template() {
  this.title = '';
  this.content = '';
  this.style = `
    .roundedImageCorners {
      itml-img-treatment: corner-small;
    }
    .showOnHover {
      tv-text-highlight-style: marquee-and-show-on-highlight;
    }
  `;
}

Template.prototype.render = function() {
  var template = `<?xml version="1.0" encoding="UTF-8" ?>
    <document>
      <head><style>${this.style}</style></head>
      ${this.content}
    </document>`;

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
};

Template.prototype.alertDescriptive = function(content) {
  this.content = `<descriptiveAlertTemplate theme="dark" style="background-color:rgba(0,0,0,0.5)">
    <title>${this.title}</title>
    ${content}
  </descriptiveAlertTemplate>`;
  return this;
};

Template.prototype.catalog = function(content) {
  this.content = `<catalogTemplate>
      <banner>
        <title>${this.title}</title>
      </banner>
      <list>${content}</list>
    </catalogTemplate>`;
  return this;
};

Template.prototype.parade = function(section, relatedContent) {
  this.content = `<paradeTemplate>
     <list>
        <header>
           <title>${this.title}</title>
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
