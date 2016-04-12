/**
 * InvoiceController
 *
 * @description :: Server-side logic for managing Invoices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const moment = require('moment');
const invoiceHelpers = require('../services/InvoiceHelper.js');

module.exports = {

  ministry: function(req, res) {
    var start = moment();
    if (req.query.back) {
      start = start.subtract(req.query.back, 'months');
    }

    var criteria = {
      sort: 'createdAt DESC',
      createdAt: {
        '>=': start.startOf('month').format(),
        '<=': start.endOf('month').format()
      }
    };
    if (req.param('id') !== 'all') {
      criteria.ministry = req.param('id') ? req.param('id') : req.session.ministry;
    }

    Invoice.find(criteria).exec(function(err, invoices) {
      if (err) return res.serverError(err);
      var total = 0;
      var summary = {};
      var previousUsage = 0
      var cumulativeUsage;

      // invoices.forEach(function(invoice, index) {
      //   var type = invoice.type;
      //   var rate = invoiceHelpers.getRatePerUsage(type, cumulativeUsage);
      //
      //   invoice.amount = invoice.units * rate;
      //   console.log('amount ', invoice.amount);
      // });

      cumulativeUsage = invoices.reduce(function(prev, current) {
        return prev + current.units
      }, 0);

      // for (var i = 0; i < invoices.length; i++) {
      //   // cumulativeUsage += invoices[i].units;
      //   var rate = invoiceHelpers.getRatePerUsage(invoices[i].type, previousUsage, cumulativeUsage);
      //   // invoices[i].amount = invoices[i].units * rate;
      //
      //   if (!summary[invoices[i].type]) {
      //     summary[invoices[i].type] = { units: 0, amount: 0 };
      //   }
      //   summary[invoices[i].type].units += invoices[i].units;
      //   summary[invoices[i].type].amount += invoices[i].amount;
      //   // total += invoices[i].amount;
      // }
      //

      // START HERE TOMORROW
      // TYPE IS NOT DEFINED RIGHT NOW
      // Need to break invoices into types then get cumulative usage per type
      total = invoiceHelpers.getInvoiceTotal(type, cumulativeUsage);
      console.log('total ', total);
      //
      // for (var i = 0; i < invoices.length; i++) {
      //   var rate = invoiceHelpers.getRatePerUsage(invoices[i].type, cumulativeUsage);
      //   invoices[i].amount = invoices[i].units * sails.config.invoice[invoices[i].type];
      //
      //   if (!summary[invoices[i].type]) {
      //     summary[invoices[i].type] = { units: 0, amount: 0 };
      //   }
      //   summary[invoices[i].type].units += invoices[i].units;
      //   summary[invoices[i].type].amount += invoices[i].amount;
      //   total += invoices[i].amount;
      // }

      res.send({
        amount: total,
        summary: summary,
        daily: invoices
      });
    });
  },

  missedDays: function(req, res) {
    var daysAgo = req.param('daysAgo') || 1;

    Machine.create('cdnUsage', 'Standard-1X', daysAgo);

    res.ok();
  }

};
