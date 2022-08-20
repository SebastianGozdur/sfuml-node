"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryService = void 0;
class QueryService {
    initiateQuery() {
        this.query = 'SELECT';
        return this;
    }
    withFields(fields) {
        this.query += ' ' + fields.join(',');
        return this;
    }
    withObject(objectName) {
        this.query += ' FROM ' + objectName;
        return this;
    }
    withWhere() {
        this.query += ' WHERE';
        return this;
    }
    withFieldCondition(field) {
        this.query += ' ' + field;
        return this;
    }
    withListFilters(filters) {
        this.query += ' IN ' + '(\'' + filters.join('\',\'') + '\')';
        return this;
    }
    getQuery() {
        return this.query;
    }
    getUrlyFormattedQuery() {
        return this.query.replace(/ /g, '+');
    }
}
exports.QueryService = QueryService;
