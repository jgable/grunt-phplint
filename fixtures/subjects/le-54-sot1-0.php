<?

// Support for namespaces has been added in 5.3.
namespace GruntPhpLint;

// Short array syntax has been added in 5.4.
$a = [42];

// Support for generators has been added via the yield keyword in 5.5.
function xrange($start, $limit, $step = 1) {
  for ($i = $start; $i <= $limit; $i += $step) {
    yield $i;
  }
}

print('Hello World');
