class reusableApi {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // 1A]filtering
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((el) => delete queryObj[el]);

    // 1B]advanced filtering

    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replaceAll(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const select = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(select);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    if (this.queryString.page) {
      let page = Number(this.queryString.page) || 1;
      let limit = Number(this.queryString.limit) || 1;
      let skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}
module.exports = reusableApi;
