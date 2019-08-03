
// https://github.com/cypress-io/eslint-plugin-cypress

describe('The Home Page', () => {
    it('successfully loads', () => {
        //expect(true).to.equal(true);
        cy.visit('http://127.0.0.1:3001/index');
        // cy.contains('type').click();
        //
        // // Get an input, type into it and verify that the value has been updated
        // cy.get('.action-email')
        //     .type('fake@email.com')
        //     .should('have.value', 'fake@email.com');
    });
});
