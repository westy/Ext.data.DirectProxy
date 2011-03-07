Ext.define('Ext.data.DirectProxy', {
	requires: ['Ext.util.MixedCollection', 'Ext.Ajax'],
	extend: 'Ext.data.ServerProxy',
	alias: 'proxy.direct',

	paramOrder: undefined,
	paramsAsHash: true,
	directFn : undefined,

	constructor: function() {
        this.addEvents(
            /**
             * @event exception
             * Fires when the server returns an exception
             * @param {Ext.data.Proxy} this
             * @param {Object} response The response from the AJAX request
             * @param {Ext.data.Operation} operation The operation that triggered request
             */
            'exception'
        );

        Ext.data.DirectProxy.superclass.constructor.apply(this, arguments);
    },

	doRequest: function(operation, callback, scope) {
		var me       = this,
			args     = [],
			directFn = me.api[operation.action] || me.directFn,
			params   = Ext.applyIf(operation.params || {}, this.extraParams || {}),
			params   = me.getParams(params, operation);

		args.push(params);

		if (me.paramsAsHash) {
			//params = Ext.encode(params);
		}

		var trans = {
            params : params || {},
            request: {
                callback : callback,
                scope : scope,
                arg : params
            },
            reader: me.getReader()
        };

        args.push(me.createCallback(trans, operation, callback, trans, scope), me);

		directFn.apply(window, args);

		return args;
	},

	createCallback : function(request, operation, callback, trans, scope) {
        var me = this,
	        action = operation.action;

        return function(result, req) {
            if (!result.success) {
                me.fireEvent('exception', me, 'remote', action, trans, res, null);
                trans.request.callback.call(me, operation);
                return;
            }
            if (action === "read") {
                me.onRead(operation, action, trans, result, req, callback, scope);
            } else {
                me.onWrite(operation, action, trans, result, req, rs);
            }
        };
    },

	onRead: function(operation, action, trans, response, request, callback, scope) {
		var me     = this,
			reader = me.getReader(),
			records;
        try {
            records = reader.readRecords(response);
        }
        catch (ex) {
            me.fireEvent('exception', me, response, operation);
            trans.request.callback.call(me, operation);
            return;
        }

        Ext.apply(operation, {
			response : response,
			resultSet: records
		});

		operation.setCompleted();
		operation.setSuccessful();

		trans.request.callback.call(scope || me, operation);
	}
});