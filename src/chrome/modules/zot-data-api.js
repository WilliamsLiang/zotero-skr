if (!Zotero.skr) Zotero.skr = {};
if (!Zotero.skr.sqlconnector) Zotero.skr.sqlconnector = {};

Zotero.skr.sqlconnector = Object.assign(Zotero.skr.sqlconnector, {
	init() {
		
	},

    async getTags(libraryId) {
        if(libraryId==-1) {
            let sql = "SELECT tagID,name FROM tags";
            let result = await Zotero.DB.queryAsync(sql);
            let tags = {};
            for (let row of result) {
                tags[row.tagID] = row.name;
            }
            Zotero.debug("[SKR]getTags: " + sql);
            return tags;
        }else{
            let tagsql = "SELECT DISTINCT t.tagID as tagID,t.name as name FROM collections c INNER JOIN collectionItems ci ON c.collectionID = ci.collectionID INNER JOIN itemTags it ON ci.itemID = it.itemID INNER JOIN tags t ON it.tagID = t.tagID WHERE c.collectionID = "+ libraryId +";"
            let result = await Zotero.DB.queryAsync(tagsql);
            let tags = {};
            for (let row of result) {
                tags[row.tagID] = row.name;
            }
            Zotero.debug("[SKR]getTags: " + tagsql);
            return tags;
        }
    },
    async getCollections() {
        let sql = `SELECT collectionID,collectionName FROM collections`;
        let result = await Zotero.DB.queryAsync(sql);
        let library = {};
        for (let row of result) {
            library[row.collectionID] = row.collectionName;
        };
        return library;
    },
    async getCollectionKey(collectionID) {
        let sql = `SELECT key FROM collections WHERE collectionID = ${collectionID}`;
        let result = await Zotero.DB.valueQueryAsync(sql);
        return result;
    },
    async getItembyCollectionAndTag(collectionID,tagID) {
        var sql;
        if(tagID!=-1 && collectionID!=-1) {
            sql = `SELECT DISTINCT i.itemID FROM itemTags i INNER JOIN collectionItems c ON i.itemID = c.itemID WHERE i.tagID = ${tagID} AND c.collectionID = ${collectionID};`;
        }else if(tagID==-1 && collectionID!=-1){
            sql = `SELECT DISTINCT c.itemID FROM collectionItems c WHERE c.collectionID = ${collectionID};`;
        }else if(tagID!=-1 && collectionID==-1) {
            sql = `SELECT DISTINCT i.itemID FROM itemTags i WHERE i.tagID = ${tagID};`;
        }else{
            return [];
        }
        let itemIDs = await Zotero.DB.columnQueryAsync(sql);
        return itemIDs;
    }
});
