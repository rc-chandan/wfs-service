/**
 * Encode format as WFS `Transaction` and return the Node.
 *
 * @param {Array.<ol.Feature>} inserts The features to insert.
 * @param {Array.<ol.Feature>} updates The features to update.
 * @param {Array.<ol.Feature>} deletes The features to delete.
 * @param {olx.format.WFSWriteTransactionOptions} options Write options.
 * @return {Node} Result.
 * @api stable
 */
ol.format.WFS.prototype.writeTransaction = function(inserts, updates, deletes,
    options) {
  var objectStack = [];
  var node = ol.xml.createElementNS(ol.format.WFS.WFSNS, 'Transaction');
  node.setAttribute('service', 'WFS');
  node.setAttribute('version', '1.1.0');
  var baseObj;
  /** @type {ol.XmlNodeStackItem} */
  var obj;
  if (options) {
    baseObj = options.gmlOptions ? options.gmlOptions : {};
    if (options.handle) {
      node.setAttribute('handle', options.handle);
    }
  }
  ol.xml.setAttributeNS(node, 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation', this.schemaLocation_);
  if (inserts) {
    obj = {node: node, 'featureNS': options.featureNS,
      'featureType': options.featureType, 'featurePrefix': options.featurePrefix,
      'srsName': options.srsName};
    ol.obj.assign(obj, baseObj);
    ol.xml.pushSerializeAndPop(obj,
        ol.format.WFS.TRANSACTION_SERIALIZERS_,
        ol.xml.makeSimpleNodeFactory('Insert'), inserts,
        objectStack);
  }
  if (updates) {
    obj = {node: node, 'featureNS': options.featureNS,
      'featureType': options.featureType, 'featurePrefix': options.featurePrefix,
      'srsName': options.srsName};
    ol.obj.assign(obj, baseObj);
    ol.xml.pushSerializeAndPop(obj,
        ol.format.WFS.TRANSACTION_SERIALIZERS_,
        ol.xml.makeSimpleNodeFactory('Update'), updates,
        objectStack);
  }
  if (deletes) {
    ol.xml.pushSerializeAndPop({node: node, 'featureNS': options.featureNS,
      'featureType': options.featureType, 'featurePrefix': options.featurePrefix,
      'srsName': options.srsName},
    ol.format.WFS.TRANSACTION_SERIALIZERS_,
    ol.xml.makeSimpleNodeFactory('Delete'), deletes,
    objectStack);
  }
  if (options.nativeElements) {
    ol.xml.pushSerializeAndPop({node: node, 'featureNS': options.featureNS,
      'featureType': options.featureType, 'featurePrefix': options.featurePrefix,
      'srsName': options.srsName},
    ol.format.WFS.TRANSACTION_SERIALIZERS_,
    ol.xml.makeSimpleNodeFactory('Native'), options.nativeElements,
    objectStack);
  }
  return node;
};
