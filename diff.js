/**
 * Created by Alex Malkevich on 05.05.14.
 */

window.addEventListener('load', main);

/**
 * @type {string}
 * @const
 */
var DOM_ID_FIRST = "first";
/**
 * @type {string}
 * @const
 */
var DOM_ID_SECOND = "second";

/**
 * @type {Object.<String, String>}
 * @const
 */
var color = {
    "added": "added",
    "removed": "removed",
    "changed": "changed"
};

/**
 * Enter point of script
 */
function main() {
    var firstObj, secondObj; // Root of DOM elements to compare

    // Get root nodes
    firstObj = document.getElementById(DOM_ID_FIRST);
    secondObj = document.getElementById(DOM_ID_SECOND);

    // Compare nodes
    var res = diff(firstObj, secondObj);
    console.log(res);
}

/**
 * Compare two DOM objects
 * @param {Object} firstObj First DOM Object to compare
 * @param {Object} secondObj Second DOM Object to compare
 * @returns {Array} Array of differences of objects
 */
function diff(firstObj, secondObj) {
    firstObj = firstObj || {};
    secondObj = secondObj || {};
    var node1 = getAllNodes(firstObj);
    var node2 = getAllNodes(secondObj);
    var difference = [], normArr = [];
    // Go throw first nodes
    for (var i = 0; i < node1.length; ++i) {
        var found = false;
        var parent1 = [], parent2 = [];
        var nod1 = {}, nod2 = {};

        // Get node2 and parent nodes
        nod1 = node1[i][node1[i].length - 1];
        if (node1[i].length > 1) parent1 = getNamesOfNode(node1[i].slice(0, -1));

        if (node2.length > i) {
            // Get node2 and parent nodes
            nod2 = node2[i][node2[i].length - 1];
            if (node2[i].length > 1) parent2 = getNamesOfNode(node2[i].slice(0, -1));

            // Compare by tag and indent
            if (nod1.tagName === nod2.tagName && parent1.compare(parent2)) {
                found = true;
                // Compare by text
                if (nod1.nodeType !== 3 && nod1.innerHTML !== nod2.innerHTML) {
                    difference.push(applyDiff("changed", nod1, nod2));
                } else if (nod1.data !== nod2.data) {
                    difference.push(applyDiff("changed", nod1, nod2));
                }
                normArr.push(i);
            } else {
                difference.push(applyDiff("added", nod2));
            }
        } else {
            for (var a = i; a < node1.length; ++a) {
                difference.push(applyDiff("removed", node1[i][node1[i].length - 1]));
            }
            break;
        }

        // Not found in second nodes
        if (!found) {
            difference.push(applyDiff("removed", nod1));
        }
    }

    // Check remaining nodes
    var max = (node1.length > node2.length) ? node1.length : node2.length;
    for (var i = 0; i < max; ++i) {
        if (normArr.indexOf(i) !== -1) continue;
        // First nodes
        if (node1[i] !== undefined) {
            // Get node
            var nod1 = node1[i][node1[i].length - 1];
            if (nod1.nodeType === 1 && nod1.hasAttribute('class')) continue;
            difference.push(applyDiff("removed", nod1));
        }
        // Second nodes
        if (node2[i] !== undefined) {
            // Get node
            var nod2 = node2[i][node2[i].length - 1];
            if (nod2.nodeType === 1 && nod2.hasAttribute('class')) continue;
            difference.push(applyDiff("added", nod2));
        }
    }
    return difference;
}

/**
 * Get all nodes of HTML Object into one dimensional array
 * @param {Object} rootObj HTML Object
 * @param {Boolean} [isChild=false] Use it only if it is a child node
 * @param {Array} [parents] Present parent node(s) for child only
 * @returns {Array} Array with all node objects of rootObj
 */
function getAllNodes(rootObj, isChild, parents) {
    isChild = isChild || false;
    parents = parents || [];
    var count = 0;
    var nodeArr = [];
    var nodes = rootObj.childNodes;
    for (var i in nodes) {
        if (nodes[i].nodeType !== undefined) {
            // Skip line breaks
            if (nodes[i].nodeType === 3 && /^\n\s+$/.test(nodes[i].data)) continue;
            nodeArr[count] = []; // Init array

            if (isChild) nodeArr[count] = nodeArr[count].concat(parents); // Add parents
            nodeArr[count].push(nodes[i]); // Add node

            // Add child nodes
            if (nodes[i].nodeType === 1 && nodes[i].childNodes.length > 0) {
                var childes = getAllNodes(nodes[i], true, nodeArr[count]);
                nodeArr = nodeArr.concat(childes); // Merge child nodes
                count += childes.length;
            }
            count++;
        }
    }
    return nodeArr;
}

/**
 * Helper for diff function. Apply changes to HTML for displaying changes
 * @param {String} action Action that should be apply
 * @param {Object} node1 Node to apply action
 * @param {Object} [node2] Node to apply action
 * @returns {Object.<String, String|Object>}
 */
function applyDiff(action, node1, node2) {
    node1 = node1 || {};
    node2 = node2 || {};

    var diffObj = {
        type: action
    };

    if (action === "changed" && node2 !== undefined) {
        applyAttribute(node1, "class", color[action]);
        applyAttribute(node2, "class", color[action]);
        diffObj.beforeElement = node1;
        diffObj.afterElement = node2;
        diffObj.html = node2.innerHTML;
    } else {
        applyAttribute(node1, "class", color[action]);
        diffObj.element = node1;
    }
    return diffObj;
}

/**
 * Helper for diff function. Apply attribute for node
 * @param {Object} node Node to apply attribute
 * @param {String} attr Attribute to apply for node
 * @param {String} val Value of attribute
 */
function applyAttribute(node, attr, val) {
    node = node || {};
    if (node.nodeType === 1) {
        node.setAttribute(attr, val);
    } else {
        // Create wrapper
        var wrapper = document.createElement('span');
        wrapper.setAttribute(attr, val);
        wrapper.innerHTML = node.data;
        if (node.nextSibling) node.parentNode.insertBefore(wrapper, node.nextSibling);
        else if (node.parentNode) node.parentNode.appendChild(wrapper);
        node.remove();
    }
}

/**
 * Helper for diff function. Get only tag names of nodes
 * @param {Array} nodes Array of nodes
 * @returns {Array}
 */
function getNamesOfNode(nodes) {
    nodes = nodes || [];
    var names = [];
    for (var i = 0; i < nodes.length; ++i) {
        names.push(nodes[i].tagName);
    }
    return names;
}

/**
 * Compare method for Array
 * @param {Array} arr Array to compare
 * @returns {boolean}
 */
Array.prototype.compare = function (arr) {
    if (!(arr instanceof Array)) return false;
    if (this.length !== arr.length) return false;

    for (var i = 0; i < this.length; ++i) {
        // Check nested arrays
        if (this[i] instanceof Array && arr[i] instanceof Array) {
            if (!this[i].compare(arr[i])) return false;
        }
        // Check objects, prop order make sense
        else if (this[i] instanceof Object && arr[i] instanceof Object) {
            try {
                if (JSON.stringify(this[i]) != JSON.stringify(arr)) return false;
            } catch (e) {
                // Something goes wrong...
                console.error(e, this[i], arr[i]);
                return false;
            }
        }
        // Compare value
        else if (this[i] !== arr[i]) return false;
    }

    return true;
};