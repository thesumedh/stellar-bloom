#![no_std]
#![allow(warnings)]
use soroban_sdk::token::Client as TokenClient;
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

#[contract]
pub struct UserWallet;

#[contractimpl]
impl UserWallet {
    /// Execute a token transfer on behalf of the `from` address.
    /// This simulates a meta-transaction where the owner authorizes the execution,
    /// and the relayer pays the gas.
    pub fn execute_transfer(env: Env, from: Address, to: Address, token: Address, amount: i128) {
        // Require authorization from the sender
        from.require_auth();

        // Perform the token transfer from the sender's balance to the destination
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&from, &to, &amount);

        // Emit an event to track the execution
        env.events().publish(
            (
                symbol_short!("executed"),
                from.clone(),
                to.clone(),
                token.clone(),
            ),
            amount,
        );
    }
}

#[cfg(test)]
mod test;
