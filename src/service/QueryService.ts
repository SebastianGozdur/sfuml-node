export class QueryService {

    query: string;

    public initiateQuery() {
        this.query = 'SELECT';
        return this;
    }

    public withFields(fields: string[]) {
        this.query += ' ' + fields.join(',');
        return this;
    }

    public withObject(objectName: string) {
        this.query += ' FROM ' + objectName;
        return this;
    }

    public withWhere() {
        this.query += ' WHERE';
        return this;
    }

    public withFieldCondition(field: string) {
        this.query += ' ' + field;
        return this;
    }

    public withListFilters(filters: string[]) {
        this.query += ' IN ' + '(\'' + filters.join('\',\'') + '\')';
        return this;
    }

    public getQuery(): string {
        return this.query;
    }

    public getUrlyFormattedQuery(): string {
        return this.query.replace(/ /g, '+');
    }
}