export const stripe = {
  charges: {
    create: jest.fn().mockImplementation((currency, amount, source) => {
      return { id: 'SID' };
    }),
  },
};
