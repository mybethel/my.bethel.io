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

Template.prototype._attributesToString = function(attributes) {
  return Object.keys(attributes).map(function(value) {
     return `${value}="${attributes[value]}"`
  }).join(' ');
};

Template.prototype._encode = function(string) {
  return String(string)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};

Template.prototype.alert = function(title, description) {
  this.content = `<alertTemplate>
                    <title>${title}</title>
                    <description>${description}</description>
                    ${this.button('Done')}
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

Template.prototype.button = function(text, attributes) {
  return `<button ${this._attributesToString(attributes)}>
    <text>${text}</text>
  </button>`;
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

Template.prototype.collectionList = function(sections) {
  return `<collectionList>
    ${sections.map(function(section) {
      if (!section.content) return ''
      return `<shelf>
      <header>
        <title>${section.title}</title>
      </header>
      <section>
        ${section.content}
      </section>
    </shelf>`; }).join('')}
  </collectionList>`;
};

Template.prototype.identityBanner = function(title, subtitle, background, backgroundAttrs, buttons) {
  return `<identityBanner>
    <background>
      <img src="${background}" ${this._attributesToString(backgroundAttrs)} />
    </background>
    <title>${title}</title>
    ${subtitle ? `<subtitle>${subtitle}</subtitle>` : ''}
    <row>
      ${buttons.map(function(button) {
        return `<buttonLockup ${new Template()._attributesToString(button.attributes)}>
          <badge src="${button.badge}" />
          <title>${button.title}</title>
        </buttonLockup>`
      }).join('')}
    </row>
  </identityBanner>`;
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
