const express = require('express');

const db = require('./data/dbConfig.js');

const server = express();

server.use(express.json());

server.get('/', (req, res) => {
    res.send(`hello from the server`)
});

server.get('/accounts', (req, res) => {
    db('accounts')
        .select()
        .modify(function(queryBuilder) {
            if (req.query.limit) {
                queryBuilder.limit(req.query.limit)
            }
            if(req.query.sortby && req.query.sortdir) {
                queryBuilder.orderBy(req.query.sortby, req.query.sortdir);
            } else if(req.query.sortby) {
                queryBuilder.orderBy(req.query.sortby);
            }
        })
        .then(accts => {
            res.status(200).json(accts);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'failed to get accounts from db' })
        });
    
    // const query = db('accounts').select();

    // if (req.query.sortby && req.query.sortdir) {
    //     query.orderBy(req.query.sortby, req.query.sortdir);
    // } else if (req.query.sortby) {
    //     query.orderBy(req.query.sortby);
    // }

    // if (req.query.limit) {
    //     query.limit(req.query.limit);
    // }

    // query
        // .then(accts => {
        //     res.status(200).json(accts);
        // })
        // .catch(err => {
        //     console.log(err);
        //     res.status(500).json({ error: 'failed to get accounts from db' })
        // });
});

server.get('/accounts/:id', validateAcct, (req, res) => {
    db.select('*').from('accounts').where({ id: req.params.id })
        .then(acct => {
            res.status(200).json(acct);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'failed to get account from db' })
        });
});

server.post('/accounts', (req, res) => {
    console.log('attempting to add:', req.body);
    
    db.insert(req.body).into('accounts')
        .then(added => {
            res.status(201).json(added);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'failed to add account to db' });
        });
});

server.put('/accounts/:id', validateAcct, (req, res) => {
    db('accounts')
        .where({ id: req.params.id })
        .update(req.body)
        .then(count => {
            res.status(200).json(count);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'failed to edit account in db' });
        });
});

server.delete('/accounts/:id', validateAcct, (req, res) => {
    db('accounts')
        .where({ id: req.params.id })
        .del()
        .then(count => {
            res.status(200).json(count);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'failed to delete account from db' });
        });
});

function validateAcct(req, res, next) {
    db.select('*').from('accounts').where({ id: req.params.id })
        .then(results => {
            if (results.length) {
                next()
            } else {
                res.status(404).json({ message: `could not locate account with ID ${req.params.id}`});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ message: `error while attempting to validate account ID ${req.params.id}` })
        });
};


module.exports = server;