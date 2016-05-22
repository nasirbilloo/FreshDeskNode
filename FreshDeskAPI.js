var request = require('request');

/*
Use it like this:
var FreshDeskAPI = requrie('FreshDeskAPI');
var fd = new FreshDeskAPI("ThisFakeEmail@gmail.com", "MyPass1234", 'http://ThisFakeCompany.freshdesk.com/');
fd.getSingleTicketFromFreshDesk("1234", function(err, ticket){
     ...
});
@author: nasir.billoo@gmail.com
*/
var FreshDeskAPI = function(user, pass, url) {
    this.user = user;
    this.pass = pass;
    this.baseURL = url;
    this.searchURL = "search/tickets.json";
    this.ticketURL = "/helpdesk/tickets/";
    this.ticketPageURL = "helpdesk/tickets.json";
    this.userURL = "contacts/";
    this.companyURL = "companies/";
    this.fullContactURL = "contacts.json";
    this.fullCompanyURL = "customers.json";
    this.fullAgentsURL = "agents.json"; //Requires a Priviliged Account
    this.fullGroupsURL = "groups.json";    //Requires a Priviliged Account
    this.authHeader = {
        timeout: 1000,
        username: this.user,
        password: this.pass
    };
    this.authHeader2 = {
        'auth': {
            'user': this.user,
            'pass': this.pass
        }
    }
};


FreshDeskAPI.prototype = {
    /*
    Get a Page full of Users from FD, each page holds like 30-50
    */
    getUsersListFromFreshDesk: function(page, cb){
        var self = this;
        var url = this.baseURL + this.fullContactURL + '?page=' + page;
        request.get(url, this.authHeader2, function(error, response, body){            
            if (!error && response.statusCode == 200){
                return cb(null, JSON.parse(body));
            }else{
                console.log("Error in getUsersList, statuscode: " + ", message: " + error);
                return cb(error, null);
            }
        });        
    },
    /*
    Get a page full of Agents from FD, each page holds like 30-50
    */
    getAgentsUsersListFromFreshDesk: function(page, cb){
        var self = this;
        var url = this.baseURL + this.fullAgentsURL + '?page=' + page;
        request.get(url, this.authHeader2, function(error, response, body){
            if (!error && response.statusCode == 200){
                return cb(null, JSON.parse(body));
            }else{
                console.log("Error in getAgentsList, statuscode: " + ", message: " + error);
                return cb(error, null);
            }
        });        
    },  
    /*
    Get a page full of Groups from FD, each page holds like 30-50
    */
    getGroupsListFromFreshDesk: function(page, cb){
        var self = this;
        var url = this.baseURL + this.fullGroupsURL + '?page=' + page;
        console.log("URL: " + url);
        request.get(url, this.authHeader2, function(error, response, body){
            if (!error && response.statusCode == 200){
                return cb(null, JSON.parse(body));
            }else{
                console.log("Error in getGroupsList, statuscode: " + ", message: " + error);
                return cb(error, null);
            }
        });
    },
    /*
    Get a page full of Companies from FD, each page holds like 30-50
    */    
    getCompanyListFromFreshDesk: function(page, cb){
        var self = this;
        var url = this.baseURL + this.fullCompanyURL + '?page=' + page;
        request.get(url, this.authHeader2, function(error, response, body){            
            if (!error && response.statusCode == 200){
                return cb(null, JSON.parse(body));
            }else{
                console.log("Error in getCompanyList, statuscode: " + ", message: " + error);                
                return cb(error, null);
            }
        });        
    },


    getSingleTicketPagefromFreshDesk: function(page, view, cb) {
        var self = this;
        //var url = this.baseURL + this.ticketPageURL + "?filter_name=" + filter + "&page=" + page;
        //var url = this.baseURL + "helpdesk/tickets/view/320671" + "?page=" + page + "&format=json";
        //var url = this.baseURL + "helpdesk/tickets/view/320121" + "?page=" + page + "&format=json";        
        var url = this.baseURL + "helpdesk/tickets/view/" + view + "?page=" + page + "&format=json";        
        
        var ret = [];
        if (page === 0) {
            return cb("Page Cannot be 0", null);
        } else {
            request.get(url, this.authHeader2, function(error, response, body){                
                if (!error && response.statusCode == 200) {
                    var results = JSON.parse(body);
                    var count = results.length;
                    cb(null, results);
                } else {
                    console.log("Error in getSinglePage..., statuscode: " + ", message: " + error);
                    return cb(error, null);                
                }
            });
        }
    },    
    /*
    Get One Single Ticket from FD, identified by ticketID
    */
    getSingleTicketFromFreshDesk: function(ticketID, cb) {
        var url = this.baseURL + this.ticketURL + ticketID + ".json";
        var self = this;
        request.get(url, this.authHeader2, function(error, response, body){                            
            if (!error && response.statusCode == 200) {
                var results = JSON.parse(body);
                var ticket = results.helpdesk_ticket;
                if (!ticket){
                    console.log("Invalid Ticket");
                    return cb("Invalid Ticket/Ticket Not Found", null);
                }
                return cb(null, ticket);                
            } else {
                console.log("Error in getSingleTicket, statuscode: " + ", message: " + error);                
                return cb(error, null);                
            }
        });
    },
    /*
    Update a ticket in FD
    */
    updateTicket: function(updateObj, ticketID, cb) {
        var url = this.baseURL + this.ticketURL + ticketID + ".json";
        var self = this;
        request({
            method:'PUT',
            uri: url,
            json:true,
            body:updateObj,
            auth:{'user':this.user, 'pass':this.pass}
        }, function(error, response, body){
            if (!error && response.statusCode == 200) {
                return cb(null, body);
            } else {
                if (response && response.statusCode)
                    console.log("Error in getSingleTicket, statuscode: " + response.statusCode + ", message: " + error);                
                else
                    console.log("Error in getSingleTicket, message: " + error);                                    
                return cb(error, null);                
            }
        });        
    },
    /*
    Resend activation email to users, undocumented API from FD
    */
    sendActivationEmail: function(userID, cb){
        var url = this.baseURL + "activations/" + userID + "/send_invite"
        var self = this;
        var headers = { "Referer": this.baseURL + "contacts", 'Content-Type': 'text/javascript'}
        request({
            method:'PUT',
            uri: url,
            json:true,
            headers:headers,
            auth:{'user':this.user, 'pass':this.pass}
        }, function(error, response, body){        
        //request.put(url, headers, function(error, response, body) {        
            console.log("Resetting Password at: " + url);
            
            if (!error && (response.statusCode == 304 ||
                           response.statusCode == 302 || 
                           response.statusCode == 200)) {
                return cb(null, JSON.parse(body));
            } else {
                if (response && response.statusCode)
                    console.log("Error in sendActivationEmail, statuscode: " + response.statusCode + ", message: " + error);                
                else
                    console.log("Error in sendActivationEmail, message: " + error);                                             
                return cb(error, null);                
            }
        });                
    },
    printMsg: function () {
        console.log("This module uses FreshDesk's REST API to do stuff");
    }
};
module.exports = FreshDeskAPI;
