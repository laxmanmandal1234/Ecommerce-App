//url: http://localhost:8080/api/v1/products?keyword=phone
//everything in a url after ? is called query or query string


class ApiFeatures{
    constructor(query, queryStr){   //here query is query in database like "Product.find()", queryStr is "{keyword:phone}"
        this.query = query;
        this.queryStr = queryStr;
        this.foundProducts;
    }

    search(){
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: "i"
            },
        } : {};
        this.foundProducts = this.query.find({ ...keyword });       //spread operator
        return this;
    }

    filter(){
        let queryStrCopy = {...this.queryStr};

        //removing some fields for category
        const removeFields = ["keyword", "page", "limit"];
        removeFields.forEach((key) => {
            delete queryStrCopy[key]
        });

        //filter for price and rating
        let stringifiedQueryStryCopy = JSON.stringify(queryStrCopy);
        stringifiedQueryStryCopy = stringifiedQueryStryCopy.replace(/gt|gte|lt|lte/gi, (key) => "$"+key);
        queryStrCopy = JSON.parse(stringifiedQueryStryCopy);

        this.foundProducts = this.query.find(queryStrCopy);
        
        return this;
    }

    pagination(resultPerPage){
        const  currentPage = this.queryStr.page || 1;
        const skip = resultPerPage*(currentPage-1);
        this.foundProducts = this.query.limit(resultPerPage).skip(skip);

        return this;
    }
}

module.exports = ApiFeatures;