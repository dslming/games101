/**
 * Returns the first parameter if not undefined, otherwise the second parameter.
 * Useful for setting a default value for a parameter.
 *
 * @function
 *
 * @param {*} a
 * @param {*} b
 * @returns {*} 如果参数a存在，则返参数a，否则返回参数b
 *
 * @example
 * param = defaultValue(param, 'default');
 */
function defaultValue(a, b) {
	if (a !== undefined && a !== null) {
		return a;
	}
	return b;
}

/**
 * A frozen empty object that can be used as the default value for options passed as
 * an object literal.
 * @type {Object}
 * @memberof defaultValue
 */
defaultValue.EMPTY_OBJECT = Object.freeze({});

export { defaultValue };
