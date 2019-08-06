// https://github.com/cypress-io/eslint-plugin-cypress

const url = '/';

const getLoadedCells = () => {
    return cy.get('.crossword-cell.loaded');
};

const getLoadedCell = (index = 0) => {
    return getLoadedCells().eq(index);
};

describe('The Home Page', () => {
    it('Successfully loads', () => {
        cy.visit(url);
    });
});

describe(`The Crossword`, () => {

    beforeEach(() => {
        cy.visit(url);
    });

    it(`Check each loaded cell has the correct class`, () => {
        getLoadedCells()
            .as('cells')
            .its('length')
            .should('eq', 58)
            .get('@cells')
            .each(cell => {
                cy.wrap(cell)
                    .its('class')
                    .should('not.have', 'valid')
                    .should('not.have', 'invalid')
                    .should('not.have', 'filled')
                    .should('not.have', 'empty')
            })
    });

    it(`Validate button works correctly`, () => {

        getLoadedCell()
            .its('class')
            .should('not.have', 'valid')
            .should('not.have', 'invalid')
        ;

        cy.get('.crossword-button').click();

        getLoadedCell()
            .its('class')
            .should('have', 'invalid')
        ;

    });

    it(`Show correct answer toggles correctly`, () => {

        getLoadedCell()
            .its('class')
            .should('not.have', 'valid')
            .should('not.have', 'invalid')
            .should('not.have', 'filled')
        ;

        cy.get('.crossword-toggle-button').click();

        getLoadedCell()
            .its('class')
            .should('not.have', 'valid')
            .should('not.have', 'invalid')
            .should('not.have', 'filled')
        ;

        cy.get('.crossword-toggle-button').click();

        getLoadedCell()
            .its('class')
            .should('not.have', 'valid')
            .should('not.have', 'invalid')
            .should('not.have', 'filled')
        ;
    });

    // it(`Cell changes state when clicked`, () => {
    //
    //     cy.get('.crossword-cell.loaded input')
    //         .eq(0)
    //         .its('length')
    //         .should('eq', 0)
    //     ;
    //
    //     getLoadedCell()
    //         //.find('input')
    //         //.its('length')
    //         //.should('eq', 0)
    //         .click()
    //         .find('input')
    //         .its('length')
    //         .should('eq', 1)
    //     ;
    // });
    //
    // it(`Cell only accepts correct input`, () => {
    //     getLoadedCell()
    //         .click()
    //         .type('5')
    //         .should('have.value', '')
    //         .type('a')
    //         .should('have.value', 'A')
    //     ;
    // });
});
