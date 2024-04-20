/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
module.exports = grammar({
  name: 'groq',
  extras: $ => [/\s/, $.comment],
  rules: {
    document: $ => repeat(choice($._expression)),
    identifier: $ => choice(/[a-z_][a-z_0-9]*/i, $.parameter),
    parameter: () => /\$[a-z_0-9]*/i,

    _value: $ =>
      choice(
        $.null,
        $.true,
        $.false,
        $.number,
        $.string,
        $.array,
        $.object,
        // TODO: Data type, but not value? Can't be used as expression.
        $.pair,
        // TODO: Data type, but not value? Can't be used as expression.
        // $._range,
      ),
    null: () => 'null',
    true: () => 'true',
    false: () => 'false',
    // tree-sitter-json
    number: () => {
      const decimal_digits = /\d+/
      return decimal_digits
      // TODO: This breaks ranges.
      const signed_integer = seq(optional('-'), decimal_digits)
      const exponent_part = seq(choice('e', 'E'), signed_integer)

      const decimal_integer_literal = seq(
        optional('-'),
        choice('0', seq(/[1-9]/, optional(decimal_digits))),
      )

      const decimal_literal = choice(
        seq(
          decimal_integer_literal,
          '.',
          optional(decimal_digits),
          optional(exponent_part),
        ),
        seq(decimal_integer_literal, optional(exponent_part)),
      )

      return token(decimal_literal)
    },
    string: $ =>
      choice(
        seq('"', optional($.string_content), '"'),
        seq("'", optional($.string_content), "'"),
      ),
    // tree-sitter-json
    string_content: $ =>
      repeat1(
        choice(token.immediate(prec(1, /[^\\"\\'\n]+/)), $.escape_sequence),
      ),
    // tree-sitter-json
    escape_sequence: _ => token.immediate(seq('\\', /(\"|\\|\/|b|f|n|r|t|u)/)),
    // TODO: Expression.
    array: $ => seq('[', commaSep($._value), ']'),
    object: $ => seq('{', commaSep($.object_entry), '}'),
    object_entry: $ =>
      seq(field('key', $._expression), ':', field('value', $._expression)),
    projection_entry: $ =>
      choice(
        $.object_entry,
        // TODO: This is too permissive (identifier, spread_expression, projection_traversal_expression).
        $._expression,
      ),
    pair: $ =>
      prec.left(
        seq(field('key', $._expression), '=>', field('value', $._expression)),
      ),
    // TODO: Should be [expression (dots) expression]
    inclusive_range: $ =>
      seq(field('left', $.number), '..', field('right', $.number)),
    exclusive_range: $ =>
      seq(field('left', $.number), '...', field('right', $.number)),
    _range: $ => choice($.inclusive_range, $.exclusive_range),

    _expression: $ =>
      choice(
        $._value,
        $.identifier,
        $.this_expression,
        // $.this_attribute_expression,
        $.everything_expression,
        $.parent_expression,
        $.func_call_expression,
        $.parenthesis_expression,
        $.spread_expression,
        $._traversal_expression,
        $.pipeline_expression,
        $._binary_expression,
        $._unary_expression,
      ),
    this_expression: () => '@',
    // this_attribute_expression: ($) => $.identifier,
    everything_expression: () => '*',
    parent_expression: () => '^',

    _binary_expression: $ =>
      choice(
        $.equality_expression,
        $.inequality_expression,
        $.less_than_expression,
        $.less_than_or_equal_expression,
        $.greater_than_expression,
        $.greater_than_or_equal_expression,
        $.in_expression,
        $.match_expression,
        $.asc_expression,
        $.desc_expression,
        $.logical_and_expression,
        $.logical_or_expression,
        $.binary_plus_expression,
        $.binary_minus_expression,
        $.binary_star_expression,
        $.binary_double_star_expression,
        $.binary_slash_expression,
        $.binary_percent_expression,
      ),
    equality_expression: $ =>
      prec.left(
        4,
        seq(field('left', $._expression), '==', field('right', $._expression)),
      ),
    inequality_expression: $ =>
      prec.left(
        4,
        seq(field('left', $._expression), '!=', field('right', $._expression)),
      ),
    less_than_expression: $ =>
      prec.left(
        4,
        seq(field('left', $._expression), '<', field('right', $._expression)),
      ),
    less_than_or_equal_expression: $ =>
      prec.left(
        4,
        seq(field('left', $._expression), '<=', field('right', $._expression)),
      ),
    greater_than_expression: $ =>
      prec.left(
        4,
        seq(field('left', $._expression), '>', field('right', $._expression)),
      ),
    greater_than_or_equal_expression: $ =>
      prec.left(
        4,
        seq(field('left', $._expression), '>=', field('right', $._expression)),
      ),
    in_expression: $ =>
      prec.left(
        4,
        seq(field('left', $._expression), 'in', field('right', $._expression)),
      ),
    match_expression: $ =>
      prec.left(
        4,
        seq(
          field('left', $._expression),
          'match',
          field('right', $._expression),
        ),
      ),
    asc_expression: $ => prec.left(4, seq(field('left', $._expression), 'asc')),
    desc_expression: $ =>
      prec.left(4, seq(field('left', $._expression), 'desc')),
    logical_and_expression: $ =>
      prec.right(
        seq(field('left', $._expression), '&&', field('right', $._expression)),
      ),
    logical_or_expression: $ =>
      prec.right(
        seq(field('left', $._expression), '||', field('right', $._expression)),
      ),
    binary_plus_expression: $ =>
      prec.left(
        6,
        seq(field('left', $._expression), '+', field('right', $._expression)),
      ),
    binary_minus_expression: $ =>
      prec.left(
        6,
        seq(field('left', $._expression), '-', field('right', $._expression)),
      ),
    binary_star_expression: $ =>
      prec.left(
        7,
        seq(field('left', $._expression), '*', field('right', $._expression)),
      ),
    binary_double_star_expression: $ =>
      prec.right(
        9,
        seq(field('left', $._expression), '**', field('right', $._expression)),
      ),
    binary_slash_expression: $ =>
      prec.left(
        7,
        seq(field('left', $._expression), '/', field('right', $._expression)),
      ),
    binary_percent_expression: $ =>
      prec.left(
        7,
        seq(field('left', $._expression), '%', field('right', $._expression)),
      ),

    _unary_expression: $ =>
      choice($.unary_plus_expression, $.unary_minus_expression),
    unary_plus_expression: $ =>
      prec.right(10, seq('+', field('right', $._expression))),
    unary_minus_expression: $ =>
      prec.right(10, seq('-', field('right', $._expression))),

    func_call_expression: $ =>
      seq(
        optional(seq(field('namespace', $.identifier), '::')),
        field('identifier', $.identifier),
        token.immediate('('),
        field('arg', commaSep($._expression)),
        ')',
      ),
    parenthesis_expression: $ =>
      seq('(', field('expression', $._expression), ')'),
    spread_expression: $ => prec.right(seq('...', $._expression)),
    _traversal_expression: $ =>
      choice(
        $.attribute_access_traversal_expression,
        $.element_access_traversal_expression,
        $.slice_traversal_expression,
        $.array_postfix_traversal_expression,
        $.projection_traversal_expression,
        $.dereference_traversal_expression,
      ),
    attribute_access_traversal_expression: $ =>
      prec(
        11,
        choice(
          seq(field('base', $._expression), '.', field('scope', $.identifier)),
          prec(
            1,
            seq(
              field('base', $.dereference_traversal_expression),
              field('scope', $.identifier),
            ),
          ),
          prec(
            1,
            seq(
              field('base', $._expression),
              '[',
              // TODO: Support any expression as args.
              field('scope', $.string),
              ']',
            ),
          ),
        ),
      ),
    element_access_traversal_expression: $ =>
      seq(
        field('base', $._expression),
        '[',
        field('idx', choice($._expression)),
        ']',
      ),
    slice_traversal_expression: $ =>
      seq(
        field('base', choice($._expression)),
        '[',
        // TODO: Support any expression as args.
        field('range', $._range),
        ']',
      ),
    array_postfix_traversal_expression: $ =>
      seq(field('base', choice($._expression)), '[', ']'),
    projection_traversal_expression: $ =>
      prec(
        4,
        seq(
          field('base', $._expression),
          '{',
          field('scope', commaSep($.projection_entry)),
          '}',
        ),
      ),
    pipeline_expression: $ =>
      seq(
        field(
          'base',
          choice(
            // TODO: Anything array-like.
            $.everything_expression,
            $.array_postfix_traversal_expression,
            $.slice_traversal_expression,
            $.element_access_traversal_expression,
            $.projection_traversal_expression,
          ),
        ),
        field('scope', repeat1(seq('|', $.func_call_expression))),
      ),
    dereference_traversal_expression: $ =>
      prec.left(
        1,
        seq(
          // TODO: Support any identify type thing.
          field('base', choice($.identifier, $._traversal_expression)),
          '->',
        ),
      ),
    // tree-sitter-json
    comment: () =>
      token(
        choice(seq('//', /.*/), seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')),
      ),
  },
})

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @return {SeqRule}
 *
 */
// tree-sitter-json
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','))
}

/**
 * Creates a rule to optionally match one or more of the rules separated by a comma
 *
 * @param {RuleOrLiteral} rule
 *
 * @return {ChoiceRule}
 *
 */
// tree-sitter-json
function commaSep(rule) {
  return optional(commaSep1(rule))
}
