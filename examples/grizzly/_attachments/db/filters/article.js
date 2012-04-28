/**
 * @author: Thomas Rampelberg <thomas@saunter.org>
 *
 * Copyright(c) 2011 Thomas Rampelberg
 */

function(doc, req) {
  if (doc.type != 'article') return false;

  if (doc.channel != req.query.channel) return false;

  return true;
}
