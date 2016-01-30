/**
 * InvoiceController
 *
 * @description :: Server-side logic for managing Invoices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

  ministry: function(req, res) {
    var ministryId = (req.param('id')) ? req.param('id') : req.session.ministry;
    Invoice.find({ ministry: ministryId, sort: 'createdAt DESC' }).exec(function (err, invoices) {
      var total = 0;
      var summary = {};
      for (var i = 0; i < invoices.length; i++) {
        invoices[i].amount = invoices[i].units * sails.config.invoice[invoices[i].type];

        if (!summary[invoices[i].type]) {
          summary[invoices[i].type] = { units: 0, amount: 0 };
        }
        summary[invoices[i].type].units += invoices[i].units;
        summary[invoices[i].type].amount += invoices[i].amount;
        total += invoices[i].amount;
      }
      res.send({
        amount: total,
        summary: summary,
        daily: invoices
      });
    });
  }

};
