// Working TX proof hex
const workingProof = '7b22726563656970744964223a22526563656970742049443a20332c20557365723a20313035222c227472616e73706f72746174696f6e54797065223a227375737461696e61626c655f7472616e73706f72746174696f6e222c2274696d657374616d70223a22323032352d30392d31345430393a35393a31372e3938395a222c2275736572526577617264223a31327d';

// Not working TX proof hex  
const notWorkingProof = '7b2276657273696f6e223a2232222c226465736372697074696f6e223a225375737461696e61626c65207472616e73706f72746174696f6e2072656365697074202d206561726e65642036204233545220666f722065636f2d667269656e646c792074726176656c222c2270726f6f66223a7b22726563656970744964223a22526563656970742049443a2032352c20557365723a2032222c2274696d657374616d70223a22323032352d31312d30345430313a30323a34372e3837335a227d2c22696d70616374223a7b22636172626f6e223a322c227472616e73706f72746174696f6e54797065223a227375737461696e61626c655f7472616e73706f72746174696f6e227d7d';

console.log('🔍 COMPARING TRANSACTION PROOFS\n');
console.log('=' .repeat(80));

console.log('\n✅ WORKING TX (Shows as "VeBetter action on ReCircle"):');
console.log('Date: 09/14/2025');
const workingDecoded = Buffer.from(workingProof, 'hex').toString('utf-8');
console.log(JSON.stringify(JSON.parse(workingDecoded), null, 2));

console.log('\n' + '='.repeat(80));

console.log('\n❌ NOT WORKING TX (Shows as "Receive"):');
console.log('Date: 11/03/2025');
const notWorkingDecoded = Buffer.from(notWorkingProof, 'hex').toString('utf-8');
console.log(JSON.stringify(JSON.parse(notWorkingDecoded), null, 2));

console.log('\n' + '='.repeat(80));
console.log('\n🔍 KEY DIFFERENCES:');
console.log('   Working: OLD proof format (simple JSON with receiptId, timestamp, userReward)');
console.log('   Not Working: NEW proof format (version 2 with description, proof object, impact)');
console.log('\n💡 CONCLUSION:');
console.log('   Your NEW proof format (with impact metrics) is BREAKING VeWorld recognition!');
console.log('   VeWorld expects the OLD simpler proof format to recognize VeBetter actions.');
