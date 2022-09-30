#@version=0.3.3

balances: HashMap[address, uint256]
threshold: public(uint256)
externalContractBeneficiary: public(address)
deadline: public(uint256)


@external
def __init__(_treshold: uint256, _externalContract: address, _deadline: uint256):
    self.threshold = _treshold
    self.externalContractBeneficiary = _externalContract
    self.deadline = block.timestamp + _deadline


@internal
def __timeLeft__() -> (uint256):
    if (block.timestamp >= self.deadline):
        return 0
    else:
         return self.deadline - block.timestamp

@internal
def __timeReached__(reached: bool):
    time: uint256 = self.__timeLeft__()
    if (reached):
        assert (time == 0)
    else:
        assert (time > 0)


@payable
@external
def stake():
    assert msg.value > 0

    self.__timeReached__(False)
    self.balances[msg.sender] += msg.value


@external
def execute():
    assert self.balance >= self.threshold
    send(self.externalContractBeneficiary, self.balance)


@external
def withdraw(to: address):
    amount: uint256 = self.balances[msg.sender]
    assert amount > 0

    self.__timeReached__(True)
    self.balances[msg.sender] = 0

    send(to, amount)

@view
@external
def timeLeft() -> (uint256):
    if (block.timestamp >= self.deadline):
        return 0
    else:
         return self.deadline - block.timestamp


