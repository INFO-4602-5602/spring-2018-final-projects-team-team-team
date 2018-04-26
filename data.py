import pickle

"""
Helper function that loads the stock data stored in self.sp_data to a dict
"""
def load_sp_data(table=None, fname=None):
    if fname is None:
        with open('sp_data/' + str(table[0]) + '/' + str(table) + '.pkl', 'rb') as f:
            return pickle.load(f)
    else:
        with open('sp_data/' + fname + '.pkl', 'rb') as f:
            return pickle.load(f)

def main():
    data = load_sp_data(fname='sp_data')
    print(data.keys())

main()
