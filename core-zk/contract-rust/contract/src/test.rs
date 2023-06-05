use near_groth16_verifier::{G1Point, G2Point, Proof, Verifier};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, log, near_bindgen, AccountId, PanicOnDefault};

use near_bigint::U256;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub verifier: Verifier,
    pub proof:Proof,

    // oth details required for rollups
    max_tx: u128,
    n_levels: u128,
    last_batch_state_root: U256,
    batch_number: u128,
    batches_roots: Vec<U256>,
    admin: AccountId,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(
        alfa1: G1Point,
        beta2: G2Point,
        gamma2: G2Point,
        delta2: G2Point,
        ic: Vec<G1Point>,
    ) -> Self {
        Self {
            verifier: Verifier::new(alfa1, beta2, gamma2, delta2, ic),
            max_tx: 0,
            n_levels: 0,
            last_batch_state_root: U256::from(0),
            batch_number: 0,
            batches_roots: Vec::new(),
            admin: env::signer_account_id(),
            proof: Proof:{
                a:G1Point{
                    x:U256::from(0),
                    y:U256::from(0)
                },
                b:G2Point{
                    x:[U256::from(0),U256::from(0)],
                    y:[U256::from(0),U256::from(0)]
                },
                c:G1Point{
                    x:U256::from(0),
                    y:U256::from(0)
                },
            }
        }
    }
    /// View method. Requires cloning the account id. new wala meet join
    pub fn get_owner_id(&self) -> AccountId {
        self.admin.clone() //https://meet.google.com/xyf-sbvv-awi
    }

    pub fn verify(&self, input: Vec<U256>, proof: Proof) -> bool {
        assert_eq!(
            env::predecessor_account_id(),
            self.admin,
            "This function is restricted to the owner"
        );
        self.verifier.verify(input, proof)
    }

    pub fn update_state(&mut self, batch_num: u128, new_state_root: U256,proof:Proof) -> bool {
        //assert!()

        assert_eq!(
            env::predecessor_account_id(),
            self.admin,
            "This function is restricted to the owner"
        );

        // update state
        if batch_num == self.batch_number + 1 {
            log!("batch added successfully");
            self.batch_number += 1;
            self.last_batch_state_root = new_state_root;
            self.batches_roots.push(new_state_root);
            self.proof=proof;
            return true;
        } else {
            log!("wrong batch number, proof is correct");
            return false;
        }
    }

    pub fn update_state_with_verify(
        &mut self,
        input: Vec<U256>,
        proof: Proof,
        batch_num: u128,
        new_state_root: U256,
    ) -> bool {
        assert_eq!(
            env::predecessor_account_id(),
            self.admin,
            "This function is restricted to the owner"
        );
        let res: bool = self.verifier.verify(input, proof);
        if res == true {
            // update state
            if batch_num == self.batch_number + 1 {
                log!("batch added successfully");
                self.batch_number += 1;
                self.last_batch_state_root = new_state_root;
                self.batches_roots.push(new_state_root);
                return true;
            } else {
                log!("wrong batch number, proof is correct");
                return false;
            }
        } else {
            log!("wrong proof or input given");

            return false;
        }
    }
}
