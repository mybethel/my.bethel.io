
exports.getRatePerUsage = function(type, previous, current) {
  if (!type || undefined === typeof usage) return;

  var rates = sails.config.invoice[type],
      levels = Object.keys(rates),
      adjustedUsage = usage / 1000000000,
      topTier = rates[rates.length - 1],
      foundRate;

  foundRate = levels.find(function(level) {
    return adjustedUsage <= parseFloat(level);
  });

  console.log('found ', foundRate);

  return foundRate ? rates[foundRate] : rates[topTier];
  //
  // levels.forEach(function(level) {
  //   if (adjustedUsage <= parseFloat(level)) {
  //     console.log('found ', rates[level]);
  //     return rates[level];
  //   }
  // });
};

exports.getUnitInBytes = function(unit) {
  switch (unit) {
    case 'gb': return 1000000000;
    default: return 1000000000;
  }
};

exports.getInvoiceTotal = function(type, usage) {
  if (!type || undefined === typeof usage) return;

  var invoice = sails.config.invoice[type],
      unit = this.getUnitInBytes(invoice.unit),
      rates = invoice.levels,
      tiers = Object.keys(rates),
      remainingUsage = usage / unit,
      currentTier = 0,
      total = 0;

// {
//   50      : 0.25 / 1000000000,
//   150     : 0.15 / 1000000000,
//   Infinity: 0.10 / 1000000000
// }

  while (remainingUsage > 0) {
    // currentTier = rates[currentTier] ? currentTier : currentTier - 1;
    // rate = rates[currentTier] ? rates[currentTier] : rates[tiers[tiers.length - 1]]; // 0.10 / 1000000000

    // This means we've reached the top tier;
    // if (!rate) {
    //   rate = rates[tiers[tiers.length - 1]];
    //   currentTier -= 1;
    // }
    var rate = rates[tiers[currentTier]],
        tier = tiers[currentTier];

    if (remainingUsage <= tier) {
      total += remainingUsage * rate;
      remainingUsage = 0;
    } else {
      total += tier * rate;
      remainingUsage -= tier;
    }

  }

  return total;
};

exports.getCumulativeUsage = function(invoices) {
  if (!invoices) return;

  return invoices.reduce(function(prev, current) {
    return prev + current.units;
  }, 0);
}
