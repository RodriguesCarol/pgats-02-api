const request = require('supertest');
const { expect } = require('chai');



describe('Transfer', () => {
    describe('POST /transfers', () => {
        let token;
        beforeEach(async () => {
            const loginMutation = `
                mutation {
                    loginUser(username: "julio", password: "123456") {
                        token
                        user {
                            username
                        }
                    }
                }
            `;
            const respostaLogin = await request('http://localhost:4000')
                .post('/graphql')
                .send({ query: loginMutation });
            
            token = respostaLogin.body.data.loginUser.token;
        });

        it('Quando informo remetente e destinatário válidos sem autenticação, recebo status code 200 e mensagem de erro', async () => {
            const mutation = `
                mutation {
                    createTransfer(from: "julio", to: "priscila", value: 100) {
                        from
                        to
                        value
                        date
                    }
                }
            `;
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .send({ query: mutation });
            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('errors');
            expect(resposta.body.errors[0].message).to.equal('Autenticação obrigatória');
        });

        it('Quando informo destinatário inexistente eu recebo status code 200 e mensagem de erro', async () => {
            const mutation = `
                mutation {
                    createTransfer(from: "julio", to: "isabelle", value: 100) {
                        from
                        to
                        value
                        date
                    }
                }
            `;
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({ query: mutation });
            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('errors');
            expect(resposta.body.errors[0].message).to.equal('Usuário remetente ou destinatário não encontrado');
        });

        it('Quando informo um valor acima do saldo, recebo status code 200 e mensagem de erro', async () => {
            const mutation = `
                mutation {
                    createTransfer(from: "julio", to: "priscila", value: 30000) {
                        from
                        to
                        value
                        date
                    }
                }
            `;
            const resposta = await request('http://localhost:4000')
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({ query: mutation });
            
            
            expect(resposta.status).to.equal(200);
            expect(resposta.body).to.have.property('errors');
            expect(resposta.body.errors[0].message).to.equal('Saldo insuficiente');
        });
    });
});
            
