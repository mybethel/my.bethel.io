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
      },
      ministry: req.param('id') ? req.param('id') : req.session.ministry
    };

    // if (req.param('id') !== 'all') {
    // }

    // criteria.groupBy = ['type'];
    // criteria.sum = ['units'];

    Invoice.find(criteria).exec(function(err, invoices) {
      if (err) return res.serverError(err);

      var ministryTotal = 0,
          groupedInvoices = _.groupBy(invoices, 'type');

      for (var invoiceType in groupedInvoices) {

        groupedInvoices[invoiceType] = {
          daily: groupedInvoices[invoiceType],
          total: 0
        };

        var usage = groupedInvoices[invoiceType].daily.reduce(function(prev, current) {
          return prev + current.units;
        }, 0);

        groupedInvoices[invoiceType].total = invoiceHelpers.getInvoiceTotal(invoiceType, usage);
        ministryTotal += groupedInvoices[invoiceType].total;
      }

      res.send({
        ministryTotal: ministryTotal,
        summary: groupedInvoices
      });

      // STARTED CHANGING THINGS AROUND DYNAMIC RATES
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

      // ORIGINAL
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

      // res.send({
      //   amount: total,
      //   summary: summary,
      //   daily: invoices
      // });
    });
  },

  missedDays: function(req, res) {
    var daysAgo = req.param('daysAgo') || 1;

    Machine.create('cdnUsage', 'Standard-1X', daysAgo);

    res.ok();
  }

};
