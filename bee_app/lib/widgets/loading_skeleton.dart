import 'package:flutter/material.dart';

class LoadingSkeleton extends StatelessWidget {
  final int itemCount;
  final double itemHeight;

  const LoadingSkeleton({super.key, this.itemCount = 4, this.itemHeight = 80});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: itemCount,
      itemBuilder: (ctx, i) => Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: SizedBox(
          height: itemHeight,
          child: Center(
            child: LinearProgressIndicator(color: Colors.grey.shade200, backgroundColor: Colors.grey.shade100),
          ),
        ),
      ),
    );
  }
}

class LoadingCard extends StatelessWidget {
  final double height;
  const LoadingCard({super.key, this.height = 100});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12, left: 16, right: 16),
      child: SizedBox(height: height),
    );
  }
}
