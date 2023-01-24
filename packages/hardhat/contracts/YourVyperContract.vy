# @version 0.3.7

from vyper.interfaces import ERC20

## ERC20 variables
NAME: constant(String[20]) = "TOKEN"
SYMBOL: constant(String[20]) = "TOK"
DECIMALS: constant(uint8) = 18
totalSupply: public(uint256)
balanceOf: public(HashMap[address, uint256])
allowance: public(HashMap[address, HashMap[address, uint256]])

owner: address

TOKENS_PER_ETH: constant(uint256) = 100
tokensPerETH: public(uint256)


@external
def __init__():
    self.owner = msg.sender
    self._mint(self, 1000 * 10 ** 18)
    self.tokensPerETH = TOKENS_PER_ETH

## ERC20 events

event Approval:
    owner: indexed(address)
    spender: indexed(address)
    value: uint256
event Transfer:
    _from: indexed(address)
    to: indexed(address)
    value: uint256

@pure
@external
def name() -> String[20]:
    return NAME

@pure
@external
def symbol() -> String[20]:
    return SYMBOL

@pure
@external
def decimals() -> uint8:
    return DECIMALS


@view
@external
def get_owner() -> address:
    return self.owner

@internal
def _mint(to: address, _value: uint256):
    self.totalSupply += _value
    self.balanceOf[to] += _value
    log Transfer(empty(address), to, _value)

@internal
def _burn(_from: address, _value: uint256):
    self.balanceOf[_from] -= _value
    self.totalSupply -= _value
    log Transfer(_from, empty(address), _value)
    
@internal
def _approve(owner: address, spender: address, _value: uint256):
    self.allowance[owner][spender] = _value
    log Approval(owner, spender, _value)
    
@internal
def _transfer(_from: address, to: address, _value: uint256):
    self.balanceOf[_from] -= _value
    self.balanceOf[to] += _value
    log Transfer(_from, to, _value)

@external
def approve(spender: address, _value: uint256) -> bool:
    self._approve(msg.sender, spender, _value)
    return True

@external
def transfer(to: address, _value: uint256) -> bool:
    self._transfer(msg.sender, to, _value)
    return True

@external
def transferFrom(_from: address, to: address, _value: uint256) -> bool: 
    if self.allowance[_from][msg.sender] != max_value(int256):
        self.allowance[_from][msg.sender] -= _value
    self._transfer(_from, to, _value)
    return True

    
@payable
@external
def buyToken() -> (uint256):
    assert msg.value > 0
    amountOfToken: uint256 = self.tokensPerETH * msg.value

    self._transfer(self, msg.sender, amountOfToken)

    return amountOfToken

@external
def withdraw():
    assert msg.sender == self.owner
    contractBalance: uint256 = self.balanceOf[self]
    self._transfer(self, self.owner, contractBalance)
    
    selfdestruct(self.owner)


@external
def sellTokens(totalTokens: uint256):
    
    totalBalance: uint256 = self.balanceOf[msg.sender]
    assert totalBalance > totalTokens

    operationAmount: uint256 = totalTokens / self.tokensPerETH
    total: uint256 = self.balance
    assert total > operationAmount

    self._transfer(msg.sender, self, totalTokens)

    send(msg.sender, operationAmount)
